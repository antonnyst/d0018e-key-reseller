"use client"
import { deleteCookie, setCookie } from 'cookies-next' 

export function login() {
    // Fake session token until api implemented
    const sessionToken = "blah!";
    setCookie("g3a-session", sessionToken);
}

export function logout() {
    deleteCookie("g3a-session");
}


type Props = {
    className?: string
}

export const LogoutButton: React.FC<Props> = (props) => {
    return (
        <button className={props.className} onClick={()=>{
            logout();
            document.location.href="/"
        }}>
            Log out!
        </button>
    );
}

