import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser } from "@fortawesome/free-solid-svg-icons";
library.add(faUser);
function Register() {
  return (
    <span>
      <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>Register
    </span>
  );
}

export default Register;
