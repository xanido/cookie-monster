import React, {
  useEffect,
  useState,
  useRef,
  Fragment,
  useCallback,
} from "react";
import { merge } from "lodash";
import {
  DetailsListLayoutMode,
  IDetailsRowProps,
  DetailsRow,
} from "@fluentui/react/lib/DetailsList";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { SelectionMode } from "@fluentui/react/lib/Utilities";
import { DeleteIcon } from "@fluentui/react-icons-mdl2";

import TransparentDetailsList from "./fluentui/transparent-details-list";
import { useActiveTab } from "../utilities/use-active-tab";

// generic utility types
// makes app properties optional except for properties listed in K
// type OptionalExcept<T, K extends keyof T> = Partial<T> & { [P in K]-?: T[P] };
// simpler:
type OptionalExcept<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

type SetCookieDetails = OptionalExcept<chrome.cookies.Cookie, "name" | "value">;
type DeleteCookieDetails = OptionalExcept<chrome.cookies.Cookie, "name">;

const COOKIES = {
  foo: "bar",
  bar: "foo",
  secret_auth_token: "topsecret",
} as const;

function CookieDetails() {
  const [cookies, setCookies] = useState<chrome.cookies.Cookie[]>([]);
  const queue = useRef(Promise.resolve());
  const activeUrl = useActiveTab();
  const activeDomain = activeUrl?.host;

  // util to reload cookies for the active domain
  const readCookiesIntoState = useCallback(() => {
    chrome.cookies.getAll(
      {
        domain: activeDomain,
      },
      (cookies_) => {
        queue.current.then(() => setCookies(cookies_));
      }
    );
  }, [activeDomain]);

  // immediately try to read the cookies after activeDomain has been determined
  useEffect(() => {
    activeDomain && readCookiesIntoState();
  }, [activeDomain, readCookiesIntoState]);

  // handler factory - deletes a specific chrome.cookies.Cookie
  // and then re-syncs the cookie state
  const handleDeleteCookie = (cookie: DeleteCookieDetails) => () => {
    chrome.cookies.remove(
      {
        url: String(activeUrl),
        name: cookie.name,
      },
      readCookiesIntoState
    );
  };

  //handler factory - inject a known cookie from the COOKIES dict
  const handleInjectCookie = (cookie: SetCookieDetails) => () => {
    chrome.cookies.set(
      {
        url: String(activeUrl),
        name: cookie.name,
        value: cookie.value,
      },
      readCookiesIntoState
    );
  };

  return (
    <Fragment>
      <PrimaryButton
        menuProps={{
          shouldFocusOnMount: true,
          items: Object.entries(COOKIES).map(([name, value]) => ({
            key: name,
            name: name,
            onClick: handleInjectCookie({ name, value }),
          })),
        }}
      >
        Inject cookie
      </PrimaryButton>

      <TransparentDetailsList
        layoutMode={DetailsListLayoutMode.justified}
        compact
        items={cookies.map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
          cookie,
        }))}
        columns={[
          {
            key: "name",
            name: "name",
            isMultiline: false,
            minWidth: 100,
            maxWidth: 200,
            fieldName: "name",
          },
          {
            key: "value",
            name: "value",
            isMultiline: true,
            minWidth: 250,
            fieldName: "value",
          },
          {
            key: "actions",
            name: "",
            onRender: (item, index, column) => {
              console.log(item);
              return <DeleteIcon onClick={handleDeleteCookie(item.cookie)} />;
            },
            minWidth: 24,
            maxWidth: 24,
          },
        ]}
        selectionMode={SelectionMode.single}
        onRenderRow={(props?: IDetailsRowProps): JSX.Element => {
          if (!props) {
            return <DetailsRow item={undefined} itemIndex={-1} />;
          }
          const customStyles = merge(props.styles, {
            root: {
              userSelect: "any",
            },
          });
          return <DetailsRow {...props} styles={customStyles} />;
        }}
      />
    </Fragment>
  );
}

export default CookieDetails;
