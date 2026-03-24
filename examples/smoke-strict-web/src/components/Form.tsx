import type { ReactElement } from "react";

type FormProps = {
	readonly displayName: string;
};

export const Form = (props: Readonly<FormProps>): ReactElement => (
	<form>
		<label htmlFor="display-name">Display name</label>
		<input
			id="display-name"
			name="displayName"
			readOnly
			type="text"
			value={props.displayName}
		/>
	</form>
);
