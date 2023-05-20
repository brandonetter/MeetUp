import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { deleteMember } from "../store/search";
library.add(faUser);
function MemberCard({ member, admin, groupid }) {
  const dispatch = useDispatch();
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
      {admin && member?.id !== user?.id && (
        <FontAwesomeIcon icon={faTrash} style={{ fontSize: "1.3rem" }} onClick={() => {
          dispatch(deleteMember(groupid, member.id))
        }} />
      )}

    </div>
  );
}
export default MemberCard;
