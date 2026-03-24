import type { ReactElement } from "react";
import type { UserCardViewModel } from "../../shared/types.js";

type UserCardProps = {
	readonly onOpenProfile: () => void;
	readonly userCard: UserCardViewModel;
};

export const UserCard = (props: UserCardProps): ReactElement => {
	const headingId = `user-card-${props.userCard.userId}`;

	return (
		<article aria-labelledby={headingId}>
			<div aria-hidden="true">{props.userCard.avatarLabel}</div>
			<h2 id={headingId}>{props.userCard.displayName}</h2>
			<p>{props.userCard.emailAddress}</p>
			<button type="button" onClick={props.onOpenProfile}>
				Open profile
			</button>
		</article>
	);
};
