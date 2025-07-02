import { storage } from "../utils/storage";

// Set data
storage.set("storydirector_user_profile", profile);

// Get data
const profile = storage.get("storydirector_user_profile");
