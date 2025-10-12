AFRAME.registerComponent("token-interaction", {
  schema: {
    held: { type: "boolean", default: false },
  },

  init: function () {
    this.grabberEntity = document.getElementById("grabber");
    this.el.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this)); // Listen for mouseup on the document
    this.worldPos = new THREE.Vector3(); // To store the world position
    this.ghostToken = null; // To store the ghost token entity
  },

  handleMouseDown: function () {
    if (!this.data.held) {
      this.possessToken();
    }
  },

  handleMouseUp: function () {
    if (this.data.held) {
      this.unpossess();
    }
  },

  possessToken: function () {
    // Take ownership of the token (synchronous)
    NAF.utils.takeOwnership(this.el);

    // Create a ghost copy of the token
    this.ghostToken = document.createElement("a-entity");

    // Copy the gltf-model from the original token
    const gltfModel = this.el.getAttribute("gltf-model");
    if (gltfModel) {
      this.ghostToken.setAttribute("gltf-model", gltfModel);
    }

    // Copy other relevant attributes (e.g., scale, rotation)
    this.ghostToken.setAttribute("scale", this.el.getAttribute("scale"));
    this.ghostToken.setAttribute("rotation", this.el.getAttribute("rotation"));

    // Make the ghost copy transparent
    this.ghostToken.setAttribute("material", {
      transparent: true, // Enable transparency
      opacity: 0.5, // Set the opacity
    });

    // Add the ghost copy to the scene
    this.el.sceneEl.appendChild(this.ghostToken);

    // Set the component's schema data to indicate the token is held
    this.el.setAttribute("token-interaction", "held", true);
    console.log("Token is possessed!");
    console.log(this.data.held); // Should log `true`
  },

  unpossess: function () {
    if (this.ghostToken) {
      // Move the original token to the ghost's position
      const ghostPosition = this.ghostToken.getAttribute("position");
      this.el.setAttribute("position", ghostPosition);

      // Remove the ghost copy from the scene
      this.ghostToken.remove();
      this.ghostToken = null;

      // Set the component's schema data to indicate the token is dropped
      this.el.setAttribute("token-interaction", "held", false);
      console.log("Token is dropped!");
      console.log(this.data.held); // Should log `false`
    }
  },

  tick: function () {
    if (this.data.held && this.ghostToken) { // Check the component's schema data and ghost token
      // Get the world position of the grabber entity
      this.grabberEntity.object3D.getWorldPosition(this.worldPos);
      // Set the ghost token's position to the grabber's world position
      this.ghostToken.setAttribute("position", this.worldPos);
    }
  },
});