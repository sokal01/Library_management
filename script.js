fetch("users.json")
.then(res => res.json())
.then(data => {
  // localStorage.setItem("users", JSON.stringify(data))
  if(!JSON.parse(localStorage.getItem("users"))) {
    localStorage.setItem("users", JSON.stringify(data))
  } 
})
.catch(err => console.log(err))

fetch("books.json")
.then(res => res.json())
.then(data =>{
  if(!JSON.parse(localStorage.getItem("books"))) {
    localStorage.setItem("books", JSON.stringify(data))
  } 
})
.catch(err => console.log(err))

function showProfile() {
    var profile = document.querySelector(".profile")
    users.find(function(user) {
      if(user.id === logInfo.user) {
        profile.innerHTML = `
          <p><span>Name:</span> ${user.name}</p>
          <p><span>Email:</span> ${user.email}</p>
          <p><span>Role:</span> ${user.role}</p>
          <p><span>Issued Book:</span> ${user.issueBook}</p>
        `
        return
      }
    })
    if(profile.style.display === "block") profile.style.display = "none"
    else profile.style.display = "block"
}

if(!localStorage.getItem("issueBook")) {
  localStorage.setItem("issueBook", JSON.stringify([]))
}

var books = JSON.parse(localStorage.getItem("books")).books
var users = JSON.parse(localStorage.getItem("users")).users
var logInfo = JSON.parse(localStorage.getItem("login"))

var loginUser = users.find(function(value) {
  if(logInfo && value.id === logInfo.user) return value
}) 

var categoryList = []
books.map(function(book) {
    categoryList.push(book.category)
})

var category = [... new Set(categoryList)]
if(window.location.pathname === "/" || window.location.pathname === "/index.html") {
  document.querySelector(".category").innerHTML = `<option value="categories">Categories</option>`
  document.querySelector(".category").innerHTML += category.map(function(value) {
    return `<option value="${value}">
                ${value}
            </option>`
})
}

function showUserInNav(){
    if(logInfo && logInfo.loggedIn) {
        document.querySelector(".login a").innerHTML = ""
        document.querySelector(".user-list a").innerHTML = loginUser.name
        document.querySelector(".logout a").innerHTML = "Logout"
    } else {
        document.querySelector(".logout a").innerHTML = ""
        document.querySelector(".user-list a").innerHTML = ""
        document.querySelector(".login a").innerHTML = "Login"
    }
    if(logInfo && loginUser.role === "admin") {
      document.querySelector(".admin a").innerHTML = "Admin Panel"
    } else {
      document.querySelector(".admin a").innerHTML = ""
    }
}
if(window.location.pathname === "/" || window.location.pathname === "/index.html") showUserInNav()
function issueBook(book, user) {
    books.find(function(value) {
        if(value.id === book && value.quantity > 1) {
            localStorage.setItem("issueBook", JSON.stringify({book: book, user: user}))
        }
    })
}

function updateQuantity(book, user) {
    var issuedBook = JSON.parse(localStorage.getItem("issueBook"))
    books.find(function(value) {
        if(value.id === book) value.quantity -= 1 
    })
    users.find(function(value) {
        if(value.id === user) {
            value.issueBook.push(book)
            value.quantity += 1
        }
    })
    localStorage.setItem("books", JSON.stringify({books: books}))
    localStorage.setItem("users", JSON.stringify({users: users}))
    issuedBook = issuedBook.filter(function(value){
      return (value.book !== book || value.user !== user)
    })
    localStorage.setItem("issueBook", JSON.stringify(issuedBook))
    location.href = "/admin.html"
}


function login() {
    var user
    var email = document.querySelector(".login-email").value
    var password = document.querySelector(".login-password").value
    if(!email || !password) {
        alert("Email and password required.")
        return
    }
    users.find(function(value) {
        if(value.email === email) user = value
    })
    if(user && user.password === password) {
        localStorage.setItem("login", JSON.stringify({
            loggedIn: true, user: user.id 
        }))
        window.location.href = "/"
    } else {
        alert("Invalid email or password.")
    }
    showUserInNav()
}

function logout() {
    localStorage.removeItem("login")
    window.location.href = "/login.html"
    showUserInNav()
}

function searchFromCategory(element) {
    var cardContainer = document.querySelector(".card_container")
    cardContainer.innerHTML = books.map(function(book) {
        if(book.category === element.value) {
            return ` <div class="card">
            <div class="card_img_des_wrap">
              <div class="card_img">
                <img src="images/${book.image}" alt="book image" />
              </div>
              <div class="card_des">
                <h2>${book.name}</h2>
                <br />
                <p>
                  Writer(s):
                  <span>${book.author}</span>
                </p>
                <br />
                <p class="card_des_category">
                  Category: <span>${book.category}</span>
                </p>
              </div>
            </div>

            <div class="card_btn">
              <button onclick="request(${book.id})">Issue Request</button>
              <p class="card_issued_text">Available: <span>${book.quantity} copy</span></p>
            </div>
          </div>`
        }
    }).join("")
}

function searchBook() {
    var searchInput = document.querySelector(".search-input")
    var cardContainer = document.querySelector(".card_container")
    if(searchInput.value === "") return
    cardContainer.innerHTML = books.map(function(book) {
        if(searchInput.value === book.name || searchInput.value == book.id) {
            return `<div class="card">
            <div class="card_img_des_wrap">
              <div class="card_img">
                <img src="images/${book.image}" alt="book image" />
              </div>
              <div class="card_des">
                <h2>${book.name}</h2>
                <br />
                <p>
                  Writer(s):
                  <span>${book.author}</span>
                </p>
                <p class="card_des_category">
                  Category: <span>${book.category}</span>
                </p>
              </div>
            </div>

            <div class="card_btn">
              <button onclick="request(${book.id})">Issue Request</button>
              <p class="card_issued_text">Available: <span>${book.quantity} copy</span></p>
            </div>
          </div>`
        }
    }).join("")
}

function request(book) {
  var singleBook = books.find(function(value) {
    if(value.id === book) return value
  })
  var issueBook = JSON.parse(localStorage.getItem("issueBook"))
  if(!loginUser) alert("Please log in")
  else if(singleBook.quantity < 2) alert("Not available")
  else {
    issueBook.push({book: book, user: loginUser.id})
    localStorage.setItem("issueBook", JSON.stringify(issueBook))
    alert("Your request has been granted")
  }
}

if(window.location.pathname === "/admin.html") {
  var issuedBook = JSON.parse(localStorage.getItem("issueBook"))
  if(loginUser.role !== "admin") location.href = "/"
  var requestContainer = document.querySelector(".request-container")
  requestContainer.innerHTML = issuedBook.map(function(value) {
    return `
          <div class="m1">
            <div class="m2">${value.user}</div>
            <div class="m2">${value.book}</div>
            <div class="m2">${books.map(function(book) {
              
              if(book.id === value.book) return book.name
            }).join("")}</div>
            <div class="m2">
              <input onclick = "updateQuantity(${value.book}, ${value.user})" value="Accept Request" />
            </div>
          </div>
          `
  }).join("")
}

function returnBook() {
  var returnUser = document.querySelector(".return-user").value
  var returnBook = document.querySelector(".return-book").value
  if(!returnBook || !returnUser) {
    alert("User id or Book Id required")
    return
  }
  books.find(function(value) {
    if(value.id == returnBook) value.quantity += 1
  })
  users.find(function(value) {
    if(value.id == returnUser) {
      value.quantity -= 1
      value.issueBook = value.issueBook.filter(function(book) {
        if(book != returnBook) return book
      })
    }
  })
  localStorage.setItem("books", JSON.stringify({books: books}))
  localStorage.setItem("users", JSON.stringify({users: users}))
  location.href = "/return.html"
}