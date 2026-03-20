var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
};
var currentUser;
var ui;
var uiConfig = {
  signInFlow: 'popup', signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID, firebase.auth.PhoneAuthProvider.PROVIDER_ID, firebase.auth.GoogleAuthProvider.PROVIDER_ID], callbacks: {
    signInSuccessWithAuthResult: function (authResult) {
      if (authResult.user) {
        afterLogin(authResult.user);
      }
      return false;
    }, signInFailure: function (error) {

    }
  },
};

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /*loop through a collection of all HTML elements:*/
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain attribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /*make an HTTP request using the attribute value as the file name:*/
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) { elmnt.innerHTML = this.responseText; }
          if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
          /*remove the attribute, and call this function once more:*/
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /*exit the function:*/
      return;
    }
  }
};



const firebaseConfig = window.KARING_CONFIG?.firebaseConfig || {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
  databaseURL: "",
};



function afterLogin(user) {
  $(".user").removeClass("d-none")
  $(".guest").addClass("d-none")
  $('#loginModal').modal('hide')
  $("#name").html("<span id='name-current' class='align-self-center  fs-5'></span><input id='name-edit' class='d-none'/><a id='name-button' class='ms-2 d-none' href='#' onclick='editName()'>Sửa tên</a>");
  $("#email").text(user.email);
  $("#phone").text(user.phoneNumber);
  if (user.photoURL) {
    $(".avatar").attr("src", user.photoURL);
  } else {
    $(".avatar").attr("src", "image/user.svg");
  }
}

function afterLogout() {
  ui.start('#firebaseui-auth-container', uiConfig);
  // if (page === "mylabs") $("#cards").empty();
  $('#modal-login').modal('hide')
  $(".user").addClass("d-none")
  $(".guest").removeClass("d-none")
  if (window.location.pathname.startsWith("/room")) {
    $('#main').hide();
    $('#drawer').hide();
  } else if (window.location.pathname.startsWith("/lab")) enterLab();

  if (currentUser != null) {
    var userStatusDatabaseRef = firebase.database().ref('/status/' + currentUser.uid);
    var isOfflineForDatabase = {
      state: 'offline', last_changed: firebase.database.ServerValue.TIMESTAMP,
    };
    userStatusDatabaseRef.set(isOfflineForDatabase)
    // if (page === "lab") {
    //     logoutRoom();
    // }
  }
}

$(function () {
  // Handler for .ready() called.
  firebase.initializeApp(firebaseConfig);
  // Initialize the FirebaseUI Widget using Firebase.
  ui = new firebaseui.auth.AuthUI(firebase.auth());

  ui.start('#firebaseui-auth-container', uiConfig);
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {  //Neu dang nhap roi
      currentUser = user;
      afterLogin(user);
    } else { //Neu chua dang nhap
      if (((window.location.pathname.startsWith("/room")) || (window.location.pathname.startsWith("/mylabs")))) //Bat buoc phai dang nhap
        $('#loginModal').modal('show')  //Hien form dang nhap
      afterLogout();
    }
    $("#login-spinner").addClass("d-none")
  });

});
function deleteItem() {
  let id = getUrlParameter("id")
  let type = getUrlParameter("type")
  let itemRef;
  if (type == "pt" || type == "dt") {
    itemRef = '/db/' + type + '/' + id;
  } else if (type == "article") {
    itemRef = '/aricles/' + id;
  }
  firebase.database().ref(itemRef).remove()

  $(".patients-info").addClass("d-none")
  $("#delete-alert").removeClass("d-none")

}
