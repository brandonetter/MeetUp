function GroupCard({ img, group }) {
  return (
    <div className="groupCard">
      <div className="groupCardImage">
        <img src={img} />
      </div>
      <div className="groupCardHeader">
        <div className="groupCardTitle">{group?.name}</div>
        <div className="groupCardLocation">
          {group?.city},{group?.state}
        </div>

        <div className="groupCardDescription">{group?.about}</div>
        <div className="groupCardMembers">{group?.numMembers} Members</div>
      </div>
    </div>
  );
}
export default GroupCard;
