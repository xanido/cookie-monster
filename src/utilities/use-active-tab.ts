import { useEffect, useState } from "react";

export function useActiveTab(): URL | undefined {
  const [activeTab, setActiveTab] = useState<URL>();

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs[0].url && setActiveTab(new URL(tabs[0].url));
      });
  });

  return activeTab;
}
