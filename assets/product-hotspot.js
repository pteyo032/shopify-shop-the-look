import { Component } from '@theme/component';
import { QuickAddComponent } from '@theme/quick-add';
import { isClickedOutside, isMobileBreakpoint, isTouchDevice, mediaQueryLarge } from '@theme/utilities';

/**
 * A custom element that manages a dialog.
 *
 * @typedef {object} Refs
 * @property {HTMLDialogElement} dialog - The dialog element.
 * @property {HTMLButtonElement} trigger - The button element.
 * @property {HTMLAnchorElement} productLink - The product link element.
 *
 * @extends Component<Refs>
 */

export class ProductHotspotComponent extends Component {
  requiredRefs = ['trigger', 'dialog'];
  timer = /** @type {number | null} */ (null);
  /** @type {number | null} */
  #closeTimer = null;

  connectedCallback() {
    super.connectedCallback();

    // Set up initial event listeners based on current breakpoint
    this.#handleBreakpointChange();

    // Listen for breakpoint changes
    mediaQueryLarge.addEventListener('change', this.#handleBreakpointChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up listeners
    this.#removeDesktopListeners();
    mediaQueryLarge.removeEventListener('change', this.#handleBreakpointChange);
  }

  /**
   * Open the quick-add modal
   * @returns {void}
   */
  #openQuickAddModal() {
    const quickAddComponent = /** @type {QuickAddComponent | null} */ (this.querySelector('quick-add-component'));

    if (!quickAddComponent) return;
    quickAddComponent.handleClick(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  /**
   * Set up desktop event listeners (hover). Listens on the host element
   * itself (which contains both the trigger button and the dialog) rather
   * than on each separately — that way there's a single continuous hover
   * region covering "+", card, and the gap between them (bridged by the
   * dialog's own safety-triangle pseudo-element), instead of two elements
   * each tracking their own enter/leave state.
   * @returns {void}
   */
  #setupDesktopListeners() {
    this.addEventListener('pointerenter', this.#handlePointerEnter);
    this.addEventListener('pointerleave', this.#handlePointerLeave);
  }

  /**
   * Remove desktop event listeners from the host element
   * @returns {void}
   */
  #removeDesktopListeners() {
    this.removeEventListener('pointerenter', this.#handlePointerEnter);
    this.removeEventListener('pointerleave', this.#handlePointerLeave);

    // Clear any pending timers
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.#cancelPendingClose();
  }

  /**
   * Handle the pointer entering the hotspot (trigger, dialog, or the gap
   * bridged by the dialog's safety triangle). Cancels any pending close and,
   * if the dialog isn't open yet, schedules opening it after a short delay.
   * @returns {void}
   */
  #handlePointerEnter = () => {
    this.#cancelPendingClose();
    const { dialog } = this.refs;
    // Guard against an already-pending open timer (this.timer), so a
    // jittery pointer re-triggering pointerenter before the first timer
    // fires doesn't schedule overlapping showDialog() calls.
    if (dialog.open || this.timer) return;

    this.timer = setTimeout(() => {
      this.timer = null;
      this.showDialog();
    }, 120);
  };

  /**
   * Handle breakpoint changes
   * @returns {void}
   */
  #handleBreakpointChange = () => {
    // Remove existing listeners
    this.#removeDesktopListeners();

    // Set up desktop hover listeners only (mobile uses on:click in template)
    if (!isMobileBreakpoint()) {
      this.#setupDesktopListeners();
    }
  };

  /**
   * Calculate the placement of the dialog.
   * @returns {Promise<void> | undefined}
   */
  #calculateDialogPlacement() {
    const { trigger, dialog } = this.refs;

    const hotspotsContainer = this.parentElement;

    if (!hotspotsContainer) {
      return;
    }

    // Spacing constants
    const BUTTON_GAP = 10; // Gap between button and dialog
    const CONTAINER_GAP = 10; // Gap from container edges
    const TOTAL_GAP = BUTTON_GAP + CONTAINER_GAP;

    // Get container bounds
    const containerRect = hotspotsContainer?.getBoundingClientRect();

    // Get button dimensions
    const triggerRect = trigger.getBoundingClientRect();

    // To get dialog dimensions, we need to temporarily show it invisibly
    // Show dialog invisibly to measure it
    dialog.style.visibility = 'hidden';
    dialog.style.display = 'block';
    dialog.style.transform = 'none';
    dialog.removeAttribute('data-placement');

    const { width: dialogWidth, height: dialogHeight } = dialog.getBoundingClientRect();

    // Reset dialog state
    dialog.style.removeProperty('display');
    dialog.style.removeProperty('visibility');
    dialog.style.removeProperty('transform');
    // Calculate button position relative to container
    const buttonLeft = triggerRect.left - containerRect.left;
    const buttonRight = triggerRect.right - containerRect.left;
    const buttonTop = triggerRect.top - containerRect.top;
    const buttonBottom = triggerRect.bottom - containerRect.top;

    // Calculate available space
    const spaceRight = containerRect.width - buttonRight - CONTAINER_GAP;
    const spaceLeft = buttonLeft - CONTAINER_GAP;

    // Determine horizontal placement
    let x = 'right';

    if (spaceRight >= dialogWidth + BUTTON_GAP) {
      x = 'right';
    } else if (spaceLeft >= dialogWidth + BUTTON_GAP) {
      x = 'left';
    } else {
      x = 'center';
    }

    // Determine vertical placement
    let y = 'bottom';
    let verticalOffset = 0;

    if (x !== 'center') {
      let dialogStartY = buttonTop; // Default to top-aligned
      let dialogEndY = buttonTop + dialogHeight;

      if (dialogEndY > containerRect.height - CONTAINER_GAP) {
        // If top-aligned overflows bottom
        dialogStartY = buttonBottom - dialogHeight;
        dialogEndY = buttonBottom;
        y = 'top';

        if (dialogStartY < CONTAINER_GAP) {
          // If bottom-aligned overflows top
          verticalOffset = CONTAINER_GAP - dialogStartY;
        } else if (dialogEndY > containerRect.height - CONTAINER_GAP) {
          // If bottom-aligned overflows bottom
          verticalOffset = -(dialogEndY - (containerRect.height - CONTAINER_GAP));
        }
      } else {
        if (dialogStartY < CONTAINER_GAP) {
          // If top-aligned overflows top
          if (dialogStartY < CONTAINER_GAP) {
            verticalOffset = CONTAINER_GAP - dialogStartY;
          }
          y = 'bottom';
        }
      }
    } else {
      // For center horizontal: position below or above button
      if (containerRect.height - buttonBottom >= dialogHeight + TOTAL_GAP) {
        y = 'bottom';
      } else if (buttonTop >= dialogHeight + TOTAL_GAP) {
        y = 'top';
      } else {
        // If neither fits well, choose based on button position
        y = buttonTop < containerRect.height / 2 ? 'bottom' : 'top';
      }
    }

    // Set placement data attribute
    dialog.dataset.placement = `${x},${y}`;

    // Apply vertical offset if needed to keep dialog in bounds
    if (verticalOffset !== 0) {
      dialog.style.setProperty('--dialog-vertical-offset', `${verticalOffset}px`);
    } else {
      dialog.style.removeProperty('--dialog-vertical-offset');
    }

    // Return a promise that resolves after a few ticks to ensure styles are applied
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Handle the pointer leaving the hotspot entirely (both trigger and
   * dialog). Doesn't close immediately — starts a short grace-period timer
   * instead, in case this was a momentary flicker. The timer is cancelled
   * by #cancelPendingClose() (via #handlePointerEnter) if the pointer
   * re-enters in time.
   * @returns {void}
   */
  #handlePointerLeave = () => {
    // Also cancel a pending "open" timer if leaving before the dialog opened
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const { dialog } = this.refs;
    if (!dialog.open) return;

    this.#cancelPendingClose();
    this.#closeTimer = setTimeout(() => {
      this.#closeTimer = null;
      this.closeDialog();
    }, 250);
  };

  /**
   * Cancel a pending grace-period close, e.g. because the pointer re-entered
   * the trigger or the dialog before it fired.
   * @returns {void}
   */
  #cancelPendingClose = () => {
    if (this.#closeTimer) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = null;
    }
  };

  /**
   * Get the product link for the hotspot product.
   * @returns {HTMLAnchorElement | null} The product link or null.
   */
  getHotspotProductLink() {
    return this.refs.productLink || null;
  }

  /**
   * Handle hotspot click - on mobile/touch devices opens quick-add, on desktop opens dialog
   * @param {MouseEvent} e - The click event
   * @returns {void}
   */
  handleHotspotClick = (e) => {
    // Check if it's a touch device (tablets) or mobile breakpoint
    if (isMobileBreakpoint() || isTouchDevice()) {
      e.preventDefault();
      e.stopPropagation();
      this.#openQuickAddModal();
    } else {
      this.showDialog();
    }
  };

  showDialog = async () => {
    const { dialog } = this.refs;
    await this.#calculateDialogPlacement();
    dialog.dataset.showing = 'true';
    dialog.show();
    document.body.addEventListener('click', this.lightDismissMouse);
    document.body.addEventListener('keydown', this.lightDismissKeyboard);
    document.body.addEventListener('keyup', this.lightDismissKeyboard);
  };

  /**
   * Close the dialog.
   * @returns {Promise<void>}
   */
  closeDialog = async () => {
    const { dialog } = this.refs;
    dialog.dataset.closing = 'true';
    dialog.close();
    document.body.removeEventListener('click', this.lightDismissMouse);
    document.body.removeEventListener('keydown', this.lightDismissKeyboard);
    document.body.removeEventListener('keyup', this.lightDismissKeyboard);
    this.#cancelPendingClose();
    // we need to use a data-attribute to keep transition-behavior working only when open
    const animations = dialog.getAnimations({ subtree: true });
    await Promise.allSettled(animations.map((a) => a.finished));
    if (!dialog.open) {
      delete dialog.dataset.showing;
      delete dialog.dataset.closing;
      delete dialog.dataset.placement;
    }
  };

  /**
   * Light dismiss the dialog.
   * @param {MouseEvent} event - The event.
   * @returns {void}
   */
  lightDismissMouse = (event) => {
    const { dialog } = this.refs;
    if (isClickedOutside(event, dialog)) {
      this.closeDialog();
    }
  };

  /**
   * Light dismiss the dialog.
   * @param {KeyboardEvent} event - The event.
   * @returns {void}
   */
  lightDismissKeyboard = (event) => {
    const { dialog } = this.refs;
    if (
      (event.type === 'keydown' && event.key === 'Escape') ||
      (event.type === 'keyup' && !dialog.matches(':is(:focus, :focus-visible, :focus-within)'))
    ) {
      this.closeDialog();
    }
  };
}

// Register custom element
customElements.define('product-hotspot-component', ProductHotspotComponent);
