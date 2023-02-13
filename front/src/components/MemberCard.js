import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser } from "@fortawesome/free-solid-svg-icons";
library.add(faUser);
function MemberCard({ member }) {
  return (
    <div className="memberCard">
      <FontAwesomeIcon icon={faUser} style={{ fontSize: "2rem" }} />
      <span className="memberCardName">
        {member.firstname || member.firstName}{" "}
        {member.lastname || member.lastName}
      </span>

      {member?.Membership?.status === "pending" && (
        <span className="pending">Pending</span>
      )}
    </div>
  );
}
export default MemberCard;
