import { useContext } from "react";
import { PreferencesContext } from "../contexts/PreferencesContext.jsx";

export const usePreferences = () => useContext(PreferencesContext);
