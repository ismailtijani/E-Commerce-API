import Paystack from "paystack";

// Initialize Paystack with your API key
const paystack = Paystack(process.env.PAYSTACK_MAIN_KEY as string);
