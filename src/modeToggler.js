import { useState } from "react";
function ModeToggler() {
    const [ darkModeOn,setDarkModeOn] = useState(false);
    const darkMode = <h1>darkmode is on</h1>;
    const lightMode = <h1>lightMode is on</h1>;
    function handleEvent2() {
        setDarkModeOn(prevMode => !prevMode);
        
    }
    return(
        <div>
            {darkModeOn ? darkMode : lightMode}
            <button onClick={() => setDarkModeOn(!darkModeOn)}>click on me</button>
        </div>
    )
}
export default ModeToggler