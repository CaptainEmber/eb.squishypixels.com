// network-templates.js
NAF.schemas.getComponentsOriginal = NAF.schemas.getComponents;
NAF.schemas.getComponents = (template) => {
  if (!NAF.schemas.hasTemplate("#avatar-template")) {
    NAF.schemas.add({
      template: "#avatar-template",
      components: [
        "position",
        "rotation",
        {
          selector: ".head",
          component: "material",
          property: "color",
        },
        "player-info",
      ],
    });
  }
  if (!NAF.schemas.hasTemplate("#token-template")) {
    NAF.schemas.add({
      template: "#token-template",
      components: [
        "position",
        "rotation",
        "scale",
        "gltf-model",
        {
          component: "material",
        },
        {
          component: "token-interaction",
          property: "held", // Synchronize the "held" attribute
        },
      ],
    });
  }
  const components = NAF.schemas.getComponentsOriginal(template);
  return components;
};