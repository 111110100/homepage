const about = document.querySelector('#about')
const contact = document.querySelector('#contact')
const aboutContent = document.querySelector('#about-content')
const contactContent = document.querySelector('#contact-content')

const horizontalCenter = Math.floor((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)/2);
const verticalCenter = Math.floor((window.innerHeight|| document.documentElement.clientHeight.document.body.clientHeight)/2);

let aboutOpen = false
let contactOpen = false

about.addEventListener('click', () => {
  if (aboutOpen) {
    return
  }
  aboutOpen = true
  const aboutBox = new WinBox({
    title: 'whoami',
    // modal: true,
    x: "center",
    y: "center",
    width: '400px',
    height: '400px',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    mount: aboutContent,
    onfocus: function () {
      this.setBackground('#00aa00')
    },
    onblur: function () {
      this.setBackground('#777')
    },
    onclose: function() {
      aboutOpen = false
      return
    }
  })
})

contact.addEventListener('click', () => {
  if (contactOpen) {
    return
  }
  contactOpen = true
  const contactBox = new WinBox({
    title: 'contact me',
    x: horizontalCenter - 150,
    y: verticalCenter - 150,
    background: '#00aa00',
    width: '400px',
    height: '400px',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    mount: contactContent,
    onfocus: function () {
      this.setBackground('#00aa00')
    },
    onblur: function () {
      this.setBackground('#777')
    },
    onclose: function() {
      contactOpen = false
      return
    }
  })
})
