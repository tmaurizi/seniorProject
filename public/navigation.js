// *******************************************************************
// NAVIGATION
// Takes users to different locations
// *******************************************************************

// <*> FUNCTIONS <*>
// *******************************************************************
// Name: Back
// Purpose: Takes user to home page
// *******************************************************************
const back = async () => {
    location.assign('/');
};

// *******************************************************************
// Name: History
// Purpose: Takes user to their history if they are logged in
// *******************************************************************
const history = async () => {
    location.assign('/history');
};

// *******************************************************************
// Name: Friend List
// Purpose: Takes user to their friends list if they are logged in
// *******************************************************************
const friendList = async () => {
    location.assign('/friends');
};

// *******************************************************************
// Name: Log In
// Purpose: Takes user to login page
// *******************************************************************
const login = async () => {
    location.assign('/login');
};

// *******************************************************************
// Name: Log Out
// Purpose: Logs player out of their account
// *******************************************************************
const logout = async () => {
    location.assign('/logout');
};

// *******************************************************************
// Name: Sign Up
// Purpose: Takes user to the sign up page
// *******************************************************************
const signup = async () => {
    location.assign('/signup');
};

// *******************************************************************
// Name: Delete Account
// Purpose: Takes user to the delete confirmation page
// *******************************************************************
const deleteAct = async () => {
    location.assign('/delete');
};