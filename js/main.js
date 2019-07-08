var serviceHost = 'http://localhost/diabettestdbsrv';
window.fn = {};

var loginUsername = "default";
var loginState = false;
var loginRole = "default";


ons.ready(function() {
	isLoggedIn();
});

if (window.openDatabase) {
	var mydb = openDatabase("dbdiabettest", "0.1", "dbdiabettest local Database", 1024 * 1024);

	mydb.transaction(function (t) {
		t.executeSql("CREATE TABLE IF NOT EXISTS userloggedin (username VARCHAR(15) UNIQUE, isLoggedIn VARCHAR(5), role VARCHAR(5))");
		t.executeSql("SELECT COUNT(*) AS count FROM userloggedin", [], function (transaction, results) {
			if (results.rows.item(0).count == '0') {
				t.executeSql("INSERT INTO userloggedin VALUES ('default', 'false', 'default')");
			}
		});
	});
} else {
	alert("WebSQL tidak didukung oleh browser ini");
}

function isLoggedIn() {
	if (mydb) {
		mydb.transaction(function (t) {
			t.executeSql("SELECT * FROM userloggedin LIMIT 1", [], function (transaction, results) {
				loginState = results.rows.item(0).isLoggedIn;
				loginRole = results.rows.item(0).role;
				loginUsername = results.rows.item(0).username;
				setMenu();
			});
		});
	} else {
		alert("Database tidak ditemukan, browser tidak mendukung WebSQL");
	}
}

window.fn.open = function() {
	var menu = document.getElementById('menu');
	menu.open();
};

window.fn.load = function(page) {
	var content = document.getElementById('content');
	var menu = document.getElementById('menu');
	content.load(page)
	.then(menu.close.bind(menu))
	.then(function() {
		if (page == 'cek_diabetes.html') {
			if (loginState == "true") {
				document.getElementById("loginAdvice").style.display = "none";
			}
		} else if (page == 'pengaturan_akun.html') {
			setEditForm();
		} else if (page == 'riwayat.html') {
			setHistoryList();
		} else if (page == 'data_diagnosis.html') {
			setDataDiagnosisList();
		} else if (page == 'data_penyakit.html') {
			setCaptionPenyakit();
			setDataPenyakitList();
		} else if (page == 'data_penanganan.html') {
			setDataPenangananList();
		} else if (page == 'data_gejala.html') {
			setDataGejalaList();
		} else if (page == 'manajemen_user.html') {
			setDataUserList();
		}
	});
};

window.fn.loadup = function(page, sourceNav) {
	var content = document.getElementById(sourceNav);
	content.pushPage(page);
};

function verify() {
	loginButton = document.getElementById("loginButton");
	loginButton.innerHTML = " <ons-icon icon='md-spinner' spin></ons-icon>";
	loginButton.setAttribute("disabled");

	username = $("#username").val();
	password = $("#password").val();

	var url = `${serviceHost}/verify_login.php?username=${username}&password=${password}`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			if (res.login_result[0].isSuccess == "true") {
				if (mydb) {
					mydb.transaction(function (t) {
						t.executeSql(`UPDATE userloggedin set username='${username}', isLoggedIn='true', role='${res.login_result[0].role}' WHERE username='default'`);
					});
				} else {
					alert("Database tidak ditemukan, browser tidak mendukung WebSQL");
				}

				isLoggedIn();
				fn.load('home.html');
			} else {
				ons.notification.alert("Login gagal")
				.then(function () {
					loginButton.innerHTML = "Login";
					loginButton.removeAttribute("disabled");
				});
			}
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function logout() {
	if (mydb) {
		mydb.transaction(function (t) {
			t.executeSql(`UPDATE userloggedin set username='default', isLoggedIn='false', role='default' WHERE isLoggedIn='true'`);
		});
		isLoggedIn();
	} else {
		alert("Database tidak ditemukan, browser tidak mendukung WebSQL");
	}
}

function daftar() {
	username = $("#daftarUsername").val();
	password = $("#daftarPassword").val();
	fullname = $("#daftarFullname").val();
	email = $("#daftarEmail").val();
	phone = $("#daftarPhone").val();
	gender = $("input[name=daftarGender]:checked").val();
	birthdate = $("#daftarBirthdate").val();
	isDiabetic = $("input[name=daftarDiabetic]:checked").val();
	isFamilyDiabetic = $("input[name=daftarFamilyDiabetic]:checked").val();

	if (username == "" || password == "" || fullname == "" || email == "" || phone == "" || birthdate == "") {
		ons.notification.alert("Lengkapi semua isian");
	} else {
		var url = `${serviceHost}/add_account.php?username=${username}&password=${password}&fullname=${fullname}&email=${email}&phone=${phone}&gender=${gender}&birthdate=${birthdate}&isDiabetic=${isDiabetic}&isFamilyDiabetic=${isFamilyDiabetic}`;
		$.ajax({
			url: url,
			method: 'GET',
			dataType: 'JSON',
			success: function (res) {
				if (res.query_result[0].isSuccess == "true") {
					ons.notification.alert("Pendaftaran Berhasil!. Silakan log in untuk melanjutkan")
					.then(function () {
						fn.load('login.html');
					});
				} else {
					ons.notification.alert("Pendaftaran Gagal, silakan coba beberapa saat lagi.");;
				}
			},
			error: function (err) {
				console.log(err);
			}
		});
	}
}

function passwordMatch(argument) {
	password = $("#daftarPassword").val();
	rePassword = $("#daftarRePassword").val();
	loginButton = document.getElementById("daftarAkunButton");

	if (password !== rePassword) {
		$("#headerRePassword").addClass('errorPasswordHeader');
		$("#headerPassword").addClass('errorPasswordHeader');
		$("#daftarRePassword").addClass('errorPasswordInput');
		$("#daftarPassword").addClass('errorPasswordInput');
		loginButton.setAttribute("disabled");
	} else {
		$("#headerRePassword").removeClass('errorPasswordHeader');
		$("#headerPassword").removeClass('errorPasswordHeader');
		$("#daftarRePassword").removeClass('errorPasswordInput');
		$("#daftarPassword").removeClass('errorPasswordInput');
		loginButton.removeAttribute("disabled");
	}
}

function processDiagnose() {
	critA = $("input[name=critA]:checked").val();
	critB = $("input[name=critB]:checked").val();
	critC = $("input[name=critC]:checked").val();
	critD = $("input[name=critD]:checked").val();
	critE = $("input[name=critE]:checked").val();
	critF = $("input[name=critF]:checked").val();
	critG = $("input[name=critG]:checked").val();
	critH = $("input[name=critH]:checked").val();
	critI = $("input[name=critI]:checked").val();
	critJ = $("input[name=critJ]:checked").val();
	critK = $("input[name=critK]:checked").val();
	critL = $("input[name=critL]:checked").val();

	fn.loadup('hasil_diagnosis.html', 'navigatorCekDiabetes');

	var url = `${serviceHost}/diagnose.php?c=${critA}${critB}${critC}${critD}${critE}${critF}${critG}${critH}${critI}${critJ}${critK}${critL}&username=${loginUsername}`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			if (res.diagnose_result[0].isDiabetic == 'Ya') {
				titleContent = `Sepertinya Anda mengalami diabetes. Kemungkinan ${res.diagnose_result[0].percentage}%`;
			} else {
				titleContent = `Bagus!, Sepertinya Anda tidak mengalami diabetes. Kemungkinan ${res.diagnose_result[0].percentage}%`;
			}

			adviceContent = res.diagnose_result[0].advice;

			print = `<ons-card>
						<div class="title">
							${titleContent}
						</div>
						<div class="content">
							${adviceContent}
						</div>
					</ons-card>`;

			document.getElementById("resultLoader").style.display = "none";
			document.getElementById("resultHolder").innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function setMenu() {
	var menuHolder = document.getElementById('menuHolder');
	var menuContent = "";

	if (loginState == "true") {
		if (loginRole == "admin") {
			menuContent += `
							<ons-list-item onclick="fn.load('manajemen_user.html')" tappable>
								<div class="left">
									<ons-icon icon="md-accounts-list-alt" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Manajemen User
								</div>
							</ons-list-item>
							<ons-list-item onclick="fn.load('data_penyakit.html')" tappable>
								<div class="left">
									<ons-icon icon="md-hotel" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Data Penyakit
								</div>
							</ons-list-item>
							<ons-list-item onclick="fn.load('data_penanganan.html')" tappable>
								<div class="left">
									<ons-icon icon="md-shield-check" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Data Penanganan
								</div>
							</ons-list-item>
							<ons-list-item onclick="fn.load('data_gejala.html')" tappable>
								<div class="left">
									<ons-icon icon="md-alert-polygon" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Data Gejala
								</div>
							</ons-list-item>
							<ons-list-item onclick="fn.load('data_diagnosis.html')" tappable>
								<div class="left">
									<ons-icon icon="md-receipt" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Data Diagnosis
								</div>
							</ons-list-item>
			`;
		} else {
			menuContent += `
							<ons-list-item onclick="fn.load('home.html')" tappable>
								<div class="left">
									<ons-icon icon="md-home" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Home
								</div>
							</ons-list-item>
							<ons-list-item onclick="fn.load('cek_diabetes.html')" tappable>
								<div class="left">
									<ons-icon icon="md-invert-colors" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Cek Diabetes
								</div>
							</ons-list-item>
							<ons-list-item onclick="fn.load('riwayat.html')" tappable>
								<div class="left">
									<ons-icon icon="md-time-restore" class="list-item__icon"></ons-icon>
								</div>
								<div class="center">
									Riwayat
								</div>
							</ons-list-item>
			`;
		}

		menuContent += `
						<ons-list-item onclick="fn.load('pengaturan_akun.html')" tappable>
							<div class="left">
								<ons-icon icon="md-account-box" class="list-item__icon"></ons-icon>
							</div>
							<div class="center">
								Pengaturan Akun
							</div>
						</ons-list-item>
					<ons-list-item onclick="logout()" tappable>
						<div class="left">
							<ons-icon icon="md-long-arrow-return" class="list-item__icon"></ons-icon>
						</div>
						<div class="center">
							Log out
						</div>
					</ons-list-item>
		`;
	} else {
		menuContent = `
						<ons-list-item onclick="fn.load('home.html')" tappable>
							<div class="left">
								<ons-icon icon="md-home" class="list-item__icon"></ons-icon>
							</div>
							<div class="center">
								Home
							</div>
						</ons-list-item>
						<ons-list-item onclick="fn.load('cek_diabetes.html')" tappable>
							<div class="left">
								<ons-icon icon="md-invert-colors" class="list-item__icon"></ons-icon>
							</div>
							<div class="center">
								Cek Diabetes
							</div>
						</ons-list-item>
						<ons-list-item onclick="fn.load('login.html')" tappable>
							<div class="left">
								<ons-icon icon="md-long-arrow-return" class="list-item__icon"></ons-icon>
							</div>
							<div class="center">
								Log In
							</div>
						</ons-list-item>
		`;
	}

	menuHolder.innerHTML = menuContent;
}

function setEditForm() {
	$("#editUsername").text(loginUsername);

	var url = `${serviceHost}/get_account.php?username=${loginUsername}`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			$("#editFullname").val(res.user[0].fullname);
			$("#editEmail").val(res.user[0].email);
			$("#editPhone").val(res.user[0].phone);
			$("#editBirthdate").val(res.user[0].birthdate);
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function edit() {
	updateButton = document.getElementById("updateButton");
	updateButton.innerHTML = " <ons-icon icon='md-spinner' spin></ons-icon>";
	updateButton.setAttribute("disabled");

	username = loginUsername;
	fullname = $("#editFullname").val();
	email = $("#editEmail").val();
	phone = $("#editPhone").val();
	gender = $("input[name=editGender]:checked").val();
	birthdate = $("#editBirthdate").val();
	isDiabetic = $("input[name=editDiabetic]:checked").val();
	isFamilyDiabetic = $("input[name=editFamilyDiabetic]:checked").val();

	if (username == "" || fullname == "" || email == "" || phone == "" || birthdate == "") {
		ons.notification.alert("Lengkapi semua isian")
		.then(function () {
			updateButton.innerHTML = "Simpan";
			updateButton.removeAttribute("disabled");
		});
	} else {
		var url = `${serviceHost}/update_account.php?username=${username}&fullname=${fullname}&email=${email}&phone=${phone}&gender=${gender}&birthdate=${birthdate}&isDiabetic=${isDiabetic}&isFamilyDiabetic=${isFamilyDiabetic}`;
		$.ajax({
			url: url,
			method: 'GET',
			dataType: 'JSON',
			success: function (res) {
				if (res.query_result[0].isSuccess == "true") {
					ons.notification.alert("Perubahan berhasil disimpan!")
					.then(function () {
						updateButton.innerHTML = "Simpan";
						updateButton.removeAttribute("disabled");
						fn.load('pengaturan_akun.html');
					});
				} else {
					ons.notification.alert("Perubahan data gagal, silakan coba beberapa saat lagi.")
					.then(function () {
						updateButton.innerHTML = "Simpan";
						updateButton.removeAttribute("disabled");
					});;
				}
			},
			error: function (err) {
				console.log(err);
			}
		});
	}
}

function setHistoryList() {
	var url = `${serviceHost}/get_diagnoseresult.php?username=${loginUsername}`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			var print = "";

			for (var i = 0; i < res.diagnose_result.length; i++) {
				if (res.diagnose_result[i].isDiabetic == "YA") {
					potensi = "BERPOTENSI DIABETES";
				} else {
					potensi = "TIDAK BERPOTENSI DIABETES"
				}

				print += `
						<ons-card>
							<div class="title">
								${res.diagnose_result[i].percentage} ${potensi}
							</div>
							<div class="content">
								<p><h5>${res.diagnose_result[i].date}</h5></p>
								<p>${res.diagnose_result[i].advice}</p>
							</div>
						</ons-card>
				`;
			}

			document.getElementById('historyHolder').innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});		
}

function setDataDiagnosisList() {
	var url = `${serviceHost}/get_diagnoseresult.php`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			var print = "";

			for (var i = 0; i < res.diagnose_result.length; i++) {
				if (res.diagnose_result[i].isDiabetic == "YA") {
					potensi = "BERPOTENSI DIABETES";
				} else {
					potensi = "TIDAK BERPOTENSI DIABETES"
				}

				print += `
						<ons-card>
							<div class="title">
								${res.diagnose_result[i].percentage} ${potensi}
							</div>
							<div class="content">
								<p><h5>${res.diagnose_result[i].date} &bull; ${res.diagnose_result[i].username}</h5></p>
								<p>${res.diagnose_result[i].advice}</p>
							</div>
						</ons-card>
				`;
			}

			document.getElementById('dataDiagnosisHolder').innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function setDataPenyakitList() {
	var url = `${serviceHost}/get_dataset.php`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			var print = "";

			for (var i = 0; i < res.dataset.length; i++) {
				print += `
						<tr>
							<td class="text-left">${res.dataset[i].id}</td>
							<td class="text-left">${res.dataset[i].A}</td>
							<td class="text-left">${res.dataset[i].B}</td>
							<td class="text-left">${res.dataset[i].C}</td>
							<td class="text-left">${res.dataset[i].D}</td>
							<td class="text-left">${res.dataset[i].E}</td>
							<td class="text-left">${res.dataset[i].F}</td>
							<td class="text-left">${res.dataset[i].G}</td>
							<td class="text-left">${res.dataset[i].H}</td>
							<td class="text-left">${res.dataset[i].I}</td>
							<td class="text-left">${res.dataset[i].J}</td>
							<td class="text-left">${res.dataset[i].K}</td>
							<td class="text-left">${res.dataset[i].L}</td>
							<td class="text-left">${res.dataset[i].X}</td>
						</tr>
				`;
			}

			document.getElementById('dataPenyakitHolder').innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function setCaptionPenyakit() {
	var url = `${serviceHost}/get_symptoms.php`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			var print = `
						<ons-card>
							<div class="content">
								<p>Pada halaman ini berisi dataset valid mengenai penderita diabetes dan non-penderita diabetes beserta kriteria yang dialami, yang didapat dari penyedia sumber informasi terpercaya.</p>
								<p>Dataset tersebut digunakan untuk proses perhitungan diagnosis yang dilakukan oleh aplikasi, sehingga validitas data sangat penting untuk memastikan hasil diagnosis menjadi valid.</p>
								<hr>
								<p><b>Keterangan : </b></p>
			`;

			for (var i = 0; i < res.symptoms.length; i++) {
				print += `
						<p>${res.symptoms[i].id} : ${res.symptoms[i].desc}</p>
				`;
			}

			print += `
								<p>X : Apakah orang tersebut menderita diabetes?</p>
							</div>
						</ons-card>
			`;

			document.getElementById('captionPenyakitHolder').innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function setDataPenangananList() {
	var url = `${serviceHost}/get_advice.php`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			var print = "";

			for (var i = 0; i < res.advice.length; i++) {
				print += `
						<ons-card>
							<div class="title">
								#${res.advice[i].id}
							</div>
							<div class="content">
								<p>${res.advice[i].desc}</p>
								<p><a><ons-icon icon="md-edit"></ons-icon> Edit</a></p>
							</div>
						</ons-card>
				`;
			}

			document.getElementById('dataPenangananHolder').innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function setDataGejalaList() {
	var url = `${serviceHost}/get_symptoms.php`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			var print = "";

			for (var i = 0; i < res.symptoms.length; i++) {
				print += `
						<tr>
							<td class="text-left">${res.symptoms[i].id}</td>
							<td class="text-left">${res.symptoms[i].desc}</td>
							<td class="text-left"><a><ons-icon icon="md-edit"></ons-icon></a></td>
						</tr>
				`;
			}

			document.getElementById('dataGejalaHolder').innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});
}

function setDataUserList() {
	var url = `${serviceHost}/get_account.php`;
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'JSON',
		success: function (res) {
			var print = "";

			for (var i = 0; i < res.user.length; i++) {
				print += `
						<tr>
							<td class="text-left">${res.user[i].username}</td>
							<td class="text-left">${res.user[i].fullname}</td>
							<td class="text-left"><a><ons-icon icon="md-edit"></ons-icon></a></td>
							<td class="text-left"><a><ons-icon icon="md-delete"></ons-icon></a></td>
						</tr>
				`;
			}

			document.getElementById('dataUserHolder').innerHTML = print;
		},
		error: function (err) {
			console.log(err);
		}
	});
}