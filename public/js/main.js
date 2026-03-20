let admin = window.KARING_CONFIG?.admin || "";

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

function makeId(tokenLen) {
  if (tokenLen == null) {
    tokenLen = 16;
  }
  var text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tokenLen; ++i)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, onValue, set, limitToLast,query} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

let db;
let app

$(function () {
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

  app = initializeApp(firebaseConfig);
  db = getDatabase();


  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      $("#heading").css("display", "block")
      $("#heading").html("Xin chao ban: " + user.uid)
      $("#signInform").css("display", "none")
      $("#btnSignOut").css("display", "block")
    } else {
      $("#signInform").css("display", "block")
    }
  });
  $("#btnSignOut").click(function () {
    signOut(auth).then(() => {
      $("#signInform").css("display", "block")
      $("#heading").html("Đăng nhập")
      $("#btnSignOut").css("display", "none")
    }).catch((error) => {
      // An error happened.
    });
  })
  $("#nav-pt").removeClass("menu-item-hover")
  $("#nav-dt").removeClass("menu-item-hover")
  $("#nav-news").removeClass("menu-item-hover")


  if (window.location.pathname.endsWith("people.html")) {
    let type = getUrlParameter("type")
    let action = getUrlParameter("action")
    if (action === "new") { //Nếu vào để thêm mới thì hiển thị form
      $(".new-content").show()
      $("#loading").hide()
      $("#new-section").removeClass("d-none")
      $(".deco").css("background-image", "url('./image/" + type + ".svg')")
      $("#patients-title").text("Các thông tin đã đăng")
    }
    else { //Nếu như là xem danh sách bệnh nhân
      $("#new-section").hide()
      if (type === "pt") {
        $("#patients-title").text("Thông tin bệnh nhân")
      }else{
        $("#patients-title").text("Thông tin người chăm sóc")
      }
    }
    if (type === "pt") {
      $("#nav-pt").addClass("menu-item-hover")
      $("#new-title").text("Đăng thông tin bệnh nhân")
      $("#label-desc").text("Bệnh lý")

    }
    else if (type === "dt") {
      $("#nav-dt").addClass("menu-item-hover")
      $("#new-title").text("Đăng thông tin người chăm sóc")
      $("#label-desc").text("Trình độ")
      $("#label-desc2").text("Trình độ:")
    
    }
    onValue(ref(db, 'db/' + type), (snapshot) => {
      const pt = snapshot.val();
      for (var f in pt) {

        //Nếu người dùng đăng nhập rồi và vào để thêm mới thì chỉ hiện những bản ghi họ đưa lên
        let publish = ""
        if (action === "new") {
          if (pt[f].uid != currentUser.uid)
            continue;
          if (!pt[f].publish || !pt[f].publish === "false") { //Nếu chưa được duyệt
            publish = '<span class="text-danger">Chưa được duyệt</p>';
          }
        } else {
          if (!pt[f].publish || !pt[f].publish === "false")
            continue;
        }
        $(".filter").removeClass("d-none")
        if (type === "pt") {
          $(".patients-info").append('<div class="patient-info shadow-card">\
              <a href="detail.html?type=pt&id='+ f + '"><div class="avatar" style="background-image:url(\'' + pt[f].image + '\')"></div></a>\
                  <div class="info">\
                      <a href="">\
                      <a href="detail.html?type=pt&id='+ f + '"><h3>' + pt[f].name + " " + '</h3>' + publish + '\
                      </a>\
                      <div class="line"><div class="locate"><img src="image/locate.svg" alt=""><span class="address">'+ pt[f].place + '</span></div> \
                          <div class="phone-num">\
                              <img src="image/Phone.svg" alt="">\
                              <span>' + pt[f].phone + '</span>\
                          </div>\
                      </div>\
                      <div class="line">\
                          <div >\
                              <span class="dark"><b>Năm sinh</b>: <span class="age">'+ pt[f].dob + '</span></span>\
                          </div>\
                          <div class="gender">\
                              <span class="dark"><b>Giới tính</b>: <span class="sex">'+ pt[f].sex + '</span></span>\
                          </div>\
                          <div class="paid">\
                              <span class="dark"><b>Mức lương (giờ):&nbsp;</b><span class="pay">'+ pt[f].pay + '</span> VNĐ</span>\
                          </div>\
                      </div>\
                      <div class="line">\
                          <span class="dark"><b>Yêu cầu</b>:</span>\
                      </div>\
                      <div class="line">\
                          <span class="dark"><b>Bệnh lý</b><span class="desc">: '+ pt[f].desc + '</span></span>\
                      </div>\
                  </div>\
              </div>')
        }
        else {
          $(".patients-info").append('<div class="patient-info shadow-card">\
              <a href="detail.html?type=dt&id='+ f + '"><div class="avatar" style="background-image:url(\'' + pt[f].image + '\')"></div></a>\
                  <div class="info">\
                  <a href="detail.html?type=dt&id='+ f + '"><h3>' + pt[f].name + " " + '</h3>' + publish + '</a>\
                      <div class="line">\
                          <div class="locate"><img src="image/locate.svg" alt=""><span class="address">'+ pt[f].hometown + '</span></div> \
                          <div class="phone-num">\
                              <img src="image/Phone.svg" alt="">\
                              <span>'+ pt[f].sdt + '</span>\
                          </div>\
                          <div><b>Năm sinh</b>:&nbsp;<span class="age">'+ pt[f].dob + '</span></div> \
                      </div>\
                      <div class="line">\
                          <div class="age">\
                              <span class="dark"><b>Kinh nghiệm</b>:&nbsp;'+ pt[f].exp + '</span>\
                          </div>\
                          <div class="gender">\
                              <span class="dark"><b>Giới tính</b>:&nbsp;<span class="sex">'+ pt[f].sex + '</span></span>\
                          </div>\
                          <div class="paid">\
                              <span class="dark"><b>Mức lương (giờ)</b>: từ <span class="pay">'+ pt[f].pay + '</span> VNĐ</span>\
                          </div>\
                      </div>\
                      <div class="line">\
                          <span class="dark"><b>Trình độ</b>:&nbsp;'+ pt[f].skill + '</span>\
                      </div>\
                      <div class="line">\
                          <span class="dark"><b>Đánh giá</b>:&nbsp;'+ pt[f].rate + '</span>\
                      </div>\
                      </div>\
              </div>')
        }
      }
      $("#loading").hide()
    }, {
      onlyOnce: true
    });
  }
  else if (window.location.pathname.endsWith("news.html")) {
    $("#nav-news").addClass("menu-item-hover")
    let action = getUrlParameter("action")
    if (action === "new") { //Nếu vào để thêm mới thì hiển thị form
      $(".new-content").show()
      $("#loading").hide()
      $("#new-section").removeClass("d-none")
      $("#patients-title").removeClass("d-none")
    }
    else { //Nếu như là xem danh sách bệnh nhân
      $("#new-section").hide()
    }
    onValue(ref(db, 'aricles'), (snapshot) => {
      const pt = snapshot.val();
      for (var f in pt) {
        let publish = ""
        if (action === "new") {
          if (pt[f].uid != currentUser.uid)
            continue;
          if (!pt[f].publish || !pt[f].publish === "false") { //Nếu chưa được duyệt
            publish = '<span class="text-danger">Chưa được duyệt</p>';
          }
        } else {
          if (!pt[f].publish || !pt[f].publish === "false")
            continue;
        }

        $(".patients-info").append('<div class="patient-info shadow-card">\
        <a href="detail.html?type=article&id='+ f + '"><div class="avatar" style="background-image:url(\'' + pt[f].image + '\')"></div></a>\
                  <div class="info">\
                      <a href="detail.html?type=article&id='+ f + '">\
                          <h3>'+ pt[f].title + " " + '</h3>' + publish + '\
                      </a>\
                      <div class="line">\
                          <span class="dark"><b>Tác giả</b>: '+ pt[f].author + '</span>\
                      </div>\
                      <div class="line">\
                          <span class="dark">'+ pt[f].content.substring(0, 200) + '...</span>\
                      </div>\
                  </div>\
              </div>')
      }
      $("#loading").hide()
    }, {
      onlyOnce: true
    });
  }
  else if (window.location.pathname.endsWith("detail.html")) {
    let type = getUrlParameter("type")
    let id = getUrlParameter("id")
    if (type === "pt") {
      onValue(ref(db, 'db/' + type + '/' + id), (snapshot) => {
        const pt = snapshot.val();
        $(".patients-info").append('<div class="patient-info shadow-card">\
            <div class="avatar" style="background-image:url(\'' + pt.image + '\')"></div>\
              <div class="info">\
                  <a href="">\
                  <h3>' + pt.name + '</h3>\
                  </a>\
                  <div class="line"><div class="locate"><img src="image/locate.svg" alt=""><span class="address">'+ pt.place + '</span></div> \
                      <div class="phone-num">\
                          <img src="image/Phone.svg" alt="">\
                          <span>090365xxxx</span>\
                      </div>\
                  </div>\
                  <div class="line">\
                      <div >\
                          <span class="dark"><b>Năm sinh</b>: <span class="age">'+ pt.dob + '</span></span>\
                      </div>\
                      <div class="gender">\
                          <span class="dark"><b>Giới tính</b>: <span class="sex">'+ pt.sex + '</span></span>\
                      </div>\
                      <div class="paid">\
                          <span class="dark"><b>Mức lương (giờ):&nbsp;</b><span class="pay">'+ pt.pay + '</span> VNĐ</span>\
                      </div>\
                  </div>\
                  <div class="line">\
                      <span class="dark"><b>Yêu cầu</b>:</span>\
                  </div>\
                  <div class="line">\
                  <span class="dark"><b>Bệnh lý</b>: '+ pt.desc + '</span>\
                  </div>\
              </div>\
          </div>')
        if (currentUser) {
          if (currentUser.uid === pt.uid || currentUser.uid == admin)
            $(".patients-info").append('<div class="mx-auto">\
          <button type="button" class="btn btn-primary " disabled>Sửa</button>\
          <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modal-delete">Xóa</button>\
        </div>')
          if (currentUser.uid == admin) {
            $(".patients-info").append('<div class="mx-auto form-check form-switch">\
          <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" '+ ((pt.publish) ? 'checked' : '') + '>\
          <label class="form-check-label" for="flexSwitchCheckDefault">Duyệt bài</label>\
        </div>')
          }
        }
        $("#loading").hide()
      }, {
        onlyOnce: true
      });
    }
    else if (type === "dt") {
      $("#comments").removeClass("d-none")
      onValue(ref(db, 'db/' + type + '/' + id), (snapshot) => {
        const pt = snapshot.val();
        $(".patients-info").append('<div class="patient-info shadow-card">\
      <div class="avatar" style="background-image:url(\'' + pt.image + '\')"></div>\
              <div class="info">\
                  <a href="">\
                  <h3>' + pt.name + '</h3>\
                  </a>\
                  <div class="line"><div class="locate"><img src="image/locate.svg" alt=""><span class="address">'+ pt.place + '</span></div> \
                      <div class="phone-num">\
                          <img src="image/Phone.svg" alt="">\
                          <span>090365xxxx</span>\
                      </div>\
                  </div>\
                  <div class="line">\
                      <div >\
                          <span class="dark"><b>Năm sinh</b>: <span class="age">'+ pt.dob + '</span></span>\
                      </div>\
                      <div class="gender">\
                          <span class="dark"><b>Giới tính</b>: <span class="sex">'+ pt.sex + '</span></span>\
                      </div>\
                      <div class="paid">\
                          <span class="dark"><b>Mức lương (giờ):&nbsp;</b><span class="pay">'+ pt.pay + '</span> VNĐ</span>\
                      </div>\
                  </div>\
                  <div class="line">\
                  <span class="dark"><b>Trình độ</b>: '+ pt.skill + '</span>\
                  </div>\
                  <div class="line '+((pt.intro)?"":"d-none")+'">\
                    <span class="dark"><b>Tự giới thiệu</b>: '+ pt.intro + '</span>\
                  </div>\
                  <div class="line">\
                      <span class="dark"><img src = "'+ pt.deg + '"></span>\
                  </div>\
              </div>\
          </div>')
        if (currentUser) {
          if (currentUser.uid === pt.uid || currentUser.uid == admin)
            $(".patients-info").append('<div class="mx-auto">\
          <button type="button" class="btn btn-primary " disabled>Sửa</button>\
          <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modal-delete">Xóa</button>\
        </div>');
          if (currentUser.uid == admin) {
            $(".patients-info").append('<div class="mx-auto form-check form-switch">\
          <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">\
          <label class="form-check-label" for="flexSwitchCheckDefault">Duyệt bài</label>\
        </div>')
          }
        }
        $("#loading").hide()
      }, {
        onlyOnce: true
      });
    }
    else if (type === "article") {
      onValue(ref(db, 'aricles/' + id), (snapshot) => {
        const pt = snapshot.val();
        $(".patients-info").append('<div class="patient-info shadow-card">\
        <div class="avatar" style="background-image:url(\'' + pt.image + '\')"></div>\
                  <div class="info">\
                          <h3>'+ pt.title + '</h3>\
                      <div class="line">\
                          <span class="dark"><b>Tác giả</b>: '+ pt.author + '</span>\
                      </div>\
                      <div class="line">\
                          <span class="dark">'+ pt.content + '...</span>\
                      </div>\
                  </div>\
              </div>')
        if (currentUser) {
          if (currentUser.uid === pt.uid || currentUser.uid == admin)
            $(".patients-info").append('<div class="mx-auto">\
              <button type="button" class="btn btn-primary " disabled>Sửa</button>\
              <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modal-delete">Xóa</button>\
            </div>')
          if (currentUser.uid == admin) {
            $(".patients-info").append('<div class="mx-auto form-check form-switch">\
              <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">\
              <label class="form-check-label" for="flexSwitchCheckDefault">Duyệt bài</label>\
            </div>')
          }
        }
        $("#loading").hide()
      }, {
        onlyOnce: true
      });
    }
  }
  else {
    onValue(query(ref(db, 'db/pt'), limitToLast(5)), (snapshot) => {
      const pt = snapshot.val();
      for (var f in pt) {
        $("#patients").prepend('<div class="patient shadow-card">\
        <a href="detail.html?type=pt&id='+ f + '"><div class="avatar" style="background-image:url(\'' + pt[f].image + '\')"></div>\
           <div class="name"><h4>'+ pt[f].name + '</h4></div>\
           <div class="locate"><p>'+ pt[f].place + '</p></div>\
        </div></a>')
      }
      $("#loading").hide()
    }, {
      onlyOnce: true
    });
    onValue(query(ref(db, 'db/dt'), limitToLast(5)), (snapshot) => {
      const pt = snapshot.val();
      for (var f in pt) {
        $("#doctors").prepend('<div class="patient shadow-card">\
        <a href="detail.html?type=dt&id='+ f + '"><div class="avatar" style="background-image:url(\'' + pt[f].image + '\')"></div>\
           <div class="name"><h4>'+ pt[f].name + '</h4></div>\
           <div class="locate"><p>'+ pt[f].exp + ' kinh nghiệm</p></div>\
        </div></a>')
      }
      $("#loading").hide()
    }, {
      onlyOnce: true
    });
    onValue(query(ref(db, 'aricles'), limitToLast(4)), (snapshot) => {
      const pt = snapshot.val();
      for (var f in pt) {
        $("#articles").append('<div class="article shadow-card">\
        <a href="detail.html?type=article&id='+ f + '">\
            <span class="heading">'+ pt[f].title + '</span>\
            <img src="'+ pt[f].image + '" alt="">\
            <div class="intro">'+ pt[f].content.replace(/(<([^>]+)>)/gi, "").substring(0, 300) + '</div>\
        </a>\
    </div>')
      }
      $("#loading").hide()
    }, {
      onlyOnce: true
    });
  }

  $("#btnSearch").click(function () {
    let address = $("#address").val();
    let sex = $("#sex").val();
    let pay_from = parseInt($("#pay_from").val());
    let pay_to = parseInt($("#pay_to").val());
    let age_from = parseInt($("#age_from").val());
    let age_to = parseInt($("#age_to").val());
    let desc = $("#desc").val();
    $(".patients-info > div.patient-info").each(function () {
      $(this).show();
      if (!$(this).find(".address").text().toLowerCase().includes(address.toLowerCase()))
        $(this).hide()
      if (parseInt($(this).find(".pay").text()) < pay_from || parseInt($(this).find(".pay").text()) > pay_to)
        $(this).hide()
      if (parseInt($(this).find(".age").text()) < age_from || parseInt($(this).find(".age").text()) > age_to)
        $(this).hide()
      if (sex !== "all" && !$(this).find(".sex").text().toLowerCase().includes(sex.toLowerCase()))
        $(this).hide()

      if (!$(this).find(".desc").text().toLowerCase().includes(desc.toLowerCase()))
        $(this).hide()
    });
  });

  $("#btnActionNew").click(function () { //Đăng thông tin
    let ok = true;
    let name = $("#new-name").val();
    if (name === "") {
      $("#new-name").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-name").removeClass("is-invalid")
      $("#new-name").addClass("is-valid")
    }
    let image = $("#new-image").val();
    if (image === "") {
      $("#new-image").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-image").removeClass("is-invalid")
      $("#new-image").addClass("is-valid")
    }

    let location = $("#new-location").val();
    if (location === "") {
      $("#new-location").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-location").removeClass("is-invalid")
      $("#new-location").addClass("is-valid")
    }

    let pay = parseInt($("#new-pay").val());
    if (isNaN(pay)) {
      $("#new-pay").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-pay").removeClass("is-invalid")
      $("#new-pay").addClass("is-valid")
    }
    let dob = parseInt($("#new-dob").val());
    if (isNaN(dob)) {
      $("#new-dob").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-dob").removeClass("is-invalid")
      $("#new-dob").addClass("is-valid")
    }
    let desc = $("#new-desc").val();
    if (desc === "") {
      $("#new-desc").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-desc").removeClass("is-invalid")
      $("#new-desc").addClass("is-valid")
    }

    let type = getUrlParameter("type")
    if (ok) {
      $("#btnActionNew").hide()
      $("#new-alert").addClass("d-none")
      set(ref(db, 'db/' + type + "/" + makeId(10)), {
        name: name,
        location: location,
        pay: pay,
        dob: dob,
        desc: desc,
        uid: currentUser.uid
      }).then(() => {
        $("#new-name").val("")
        $("#new-image").val("")
        $("#new-location").val("")
        $("#new-pay").val("")
        $("#new-dob").val("")
        $("#new-desc").val("")

        $("#new-name").removeClass("is-valid")
        $("#new-image").removeClass("is-valid")
        $("#new-location").removeClass("is-valid")
        $("#new-pay").removeClass("is-valid")
        $("#new-dob").removeClass("is-valid")
        $("#new-desc").removeClass("is-valid")

        $("#new-alert").removeClass("d-none")
        $("#btnActionNew").show()
      });
    }
  });

  $("#btnActionNewNews").click(function () { //Đăng thông tin
    let ok = true;
    let title = $("#new-title1").val();
    if (title === "") {
      $("#new-title1").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-title1").removeClass("is-invalid")
      $("#new-title1").addClass("is-valid")
    }
    let image = $("#new-image").val();
    if (image === "") {
      $("#new-image").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-image").removeClass("is-invalid")
      $("#new-image").addClass("is-valid")
    }

    let content = $("#new-content").val();
    if (content === "") {
      $("#new-content").addClass("is-invalid")
      ok = false;
    } else {
      $("#new-content").removeClass("is-invalid")
      $("#new-content").addClass("is-valid")
    }

    if (ok) {
      $("#btnActionNewNews").hide()
      $("#new-alert").addClass("d-none")
      set(ref(db, 'aricles/' + makeId(10)), {
        name: title,
        image: image,
        content: content,
        uid: currentUser.uid
      }).then(() => {
        $("#new-title").val("")
        $("#new-image").val("")
        $("#new-context").text("")

        $("#new-title").removeClass("is-valid")
        $("#new-image").removeClass("is-valid")
        $("#new-context").removeClass("is-valid")

        $("#new-alert").removeClass("d-none")
        $("#btnActionNewNews").show()
      });
    }
  });
});

