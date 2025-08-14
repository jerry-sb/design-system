export * from "./slot";

export function composeEventHandlers<E extends React.SyntheticEvent>(
    theirs?: (e: E) => void,
    ours?: (e: E) => void,
    {checkForDefaultPrevented = true} = {}
) {
    return (event: E) => {
        theirs?.(event);
        if (checkForDefaultPrevented === false || !event.defaultPrevented) {
            ours?.(event)
        }
    }
}