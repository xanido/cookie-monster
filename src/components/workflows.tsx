import React, { Fragment, useEffect, useState } from "react";
import { ITag, Label, PrimaryButton, TagPicker } from "@fluentui/react";
import { useActiveTab } from "../utilities/use-active-tab";

export default function Workflows(props: any) {
  const [source, setSource] = useState<ITag | null>();
  const [dest, setDest] = useState<ITag | null>();
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);

  // read the current active tab url
  const activeTab = useActiveTab();
  useEffect(() => {
    if (!activeTab) return;
    setDest({ name: activeTab.host, key: activeTab.host });
  }, [activeTab]);

  useEffect(() => {
    chrome.cookies.getAll({}, (cookies) =>
      setAvailableDomains(
        cookies.reduce((prev: string[], cur: chrome.cookies.Cookie) => {
          if (!prev.includes(cur.domain)) {
            prev.push(cur.domain);
          }
          return prev;
        }, [])
      )
    );
  }, []);

  const suggestions = availableDomains.map((domain) => ({
    key: domain,
    name: domain,
  }));

  const handleIt = () => {
    chrome.cookies.getAll({ domain: source?.name }, (cookies) => {
      cookies.forEach((cookie) => {
        const { domain, path, hostOnly, session, ...restCookie } = cookie;
        chrome.cookies.set({ ...restCookie, url: `https://${dest?.name}` });
      });
    });
  };

  return (
    <Fragment>
      <Label htmlFor={"source"}>Copy cookies from</Label>
      <TagPicker
        inputProps={{
          id: "source",
        }}
        onResolveSuggestions={(filter, selectedItems) =>
          suggestions.filter(({ name }) => name.includes(filter))
        }
        itemLimit={1}
        onItemSelected={(item) => {
          setSource(item);
          return item ?? null;
        }}
        onChange={(items) => setSource(items ? items[0] : null)}
        selectedItems={source ? [source] : []}
      />

      <Label htmlFor={"destination"}>Copy cookies to</Label>
      <TagPicker
        inputProps={{
          id: "destination",
        }}
        onResolveSuggestions={(filter, selectedItems) => [
          { name: filter, key: filter },
          ...suggestions.filter(({ name }) => name.includes(filter)),
        ]}
        itemLimit={1}
        onItemSelected={(item) => {
          setDest(item);
          return item ?? null;
        }}
        onChange={(items) => setDest(items ? items[0] : null)}
        selectedItems={dest ? [dest] : []}
      />
      <PrimaryButton onClick={handleIt}>Do it</PrimaryButton>
    </Fragment>
  );
}
