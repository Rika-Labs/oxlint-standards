import type { ReactNode } from "react";

type LayoutProps = {
	readonly children: ReactNode;
};

export default function Layout(props: Readonly<LayoutProps>): ReactNode {
	return (
		<html lang="en">
			<body>{props.children}</body>
		</html>
	);
}
