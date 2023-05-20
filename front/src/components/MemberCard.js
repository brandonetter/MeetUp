import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
library.add(faUser);
function MemberCard({ member }) {
  const user = useSelector((state) => state.session.user);
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
      {member?.id !== user?.id && (
        <FontAwesomeIcon icon={faTrash} style={{ fontSize: "1.5rem" }} />
      )}

    </div>
  );
}
export default MemberCard;
