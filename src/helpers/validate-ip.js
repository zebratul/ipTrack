export function validateIPaddress(userInput) {  //валидация инпута от юзера. Честно скопировано из этих ваших интернетов 
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(userInput)) {  
      return true
    }  
    console.log("You have entered an invalid IP address!");
    return false
}