import type { ReactElement, ReactNode } from "react";

type ButtonProps = {
	readonly children: ReactNode;
	readonly onPress: () => void;
	readonly disabled?: boolean;
};

export const Button = (props: Readonly<ButtonProps>): ReactElement => (
	<button
		aria-label="Save profile"
		type="button"
		onClick={props.onPress}
		disabled={props.disabled}
	>
		{props.children}
	</button>
);
