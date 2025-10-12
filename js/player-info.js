// player-info.js
AFRAME.registerComponent("player-info", {
  schema: {
    name: {
      type: "string",
      default: "user-" + Math.round(Math.random() * 10000),
    },
    color: {
      type: "color",
      default: window.ntExample.randomColor(),
    },
  },

  init: function () {
    this.head = this.el.querySelector(".head");
    this.nametag = this.el.querySelector(".nametag");

    this.ownedByLocalUser = this.el.id === "player";
    if (this.ownedByLocalUser) {
      this.nametagInput = document.getElementById("username-overlay");
      this.nametagInput.value = this.data.name;

      document.querySelector("#color-changer").style.backgroundColor =
        this.data.color;
      document.querySelector("#color-changer").style.color = this.data.color;
    }
  },

  update: function () {
    if (this.head)
      this.head.setAttribute("material", "color", this.data.color);
    if (this.nametag) this.nametag.setAttribute("value", this.data.name);
  },
});