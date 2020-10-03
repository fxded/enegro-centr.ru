
document.querySelector('#signup-submit').onclick = function () {
    console.log("register");
    let pass = document.querySelector('#signup-pass').value,
        passConf = document.querySelector('#password_conf').value,
        email = document.querySelector('#signup-email').value;

    if ((pass != passConf) || (email == '')) { 
        alert("Passwords do not match or empty field. Please try again.");
    } else {
        data = JSON.stringify({ pass    : pass,
                                email   : email });
        ajax('/signin', 'POST', showData, data);
    }
}

function showData(data) {
    data = JSON.parse(data.response);
    console.log('user cred: ', data);
    document.location.href = "login.html";
 }
