/**
 * Dynamically loads the Razorpay Checkout SDK script.
 * Reuses existing script element if already present.
 * @returns {Promise<boolean>} Resolves to true if script is loaded successfully, false otherwise.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If Razorpay SDK is already loaded on window
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists in DOM
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    // Inject Razorpay checkout script into document head
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};
