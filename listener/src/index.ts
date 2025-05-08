import { POLLING_INTERVAL } from "./constants";

setInterval(() => {
  try {
    console.log("Run price difference logic.");
  } catch (error) {
    console.error("Error when checking price differences:", error);
  }
}, POLLING_INTERVAL);
