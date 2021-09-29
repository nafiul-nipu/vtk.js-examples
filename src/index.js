const vtkFullScreenRenderWindow = vtk.Rendering.Misc.vtkFullScreenRenderWindow;
const vtkHttpDataSetReader = vtk.IO.Core.vtkHttpDataSetReader;
const vtkVolume = vtk.Rendering.Core.vtkVolume;
const vtkVolumeMapper = vtk.Rendering.Core.vtkVolumeMapper;
const vtkColorTransferFunction = vtk.Rendering.Core.vtkColorTransferFunction;

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0]
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------
// Server is not sending the .gz and whith the compress header
// Need to fetch the true file name and uncompress it locally
// ----------------------------------------------------------------------------

const reader = vtkHttpDataSetReader.newInstance({
  fetchGzip: true
});

const actor = vtkVolume.newInstance();
const mapper = vtkVolumeMapper.newInstance();
mapper.setSampleDistance(1.1);
actor.setMapper(mapper);

// create color and opacity transfer functions
const ctfun = vtkColorTransferFunction.newInstance();
ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
const ofun = vtk.Common.DataModel.vtkPiecewiseFunction.newInstance();
ofun.addPoint(0.0, 0.0);
ofun.addPoint(255.0, 1.0);
actor.getProperty().setRGBTransferFunction(0, ctfun);
actor.getProperty().setScalarOpacity(0, ofun);
actor.getProperty().setScalarOpacityUnitDistance(0, 3.0);
actor.getProperty().setInterpolationTypeToLinear();
actor.getProperty().setUseGradientOpacity(0, true);
actor.getProperty().setGradientOpacityMinimumValue(0, 2);
actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
actor.getProperty().setGradientOpacityMaximumValue(0, 20);
actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
actor.getProperty().setShade(true);
actor.getProperty().setAmbient(0.2);
actor.getProperty().setDiffuse(0.7);
actor.getProperty().setSpecular(0.3);
actor.getProperty().setSpecularPower(8.0);

mapper.setInputConnection(reader.getOutputPort());

reader
  .setUrl("src/0.2_v3.vti")
  .then(() => {
    reader.loadData().then(() => {
      renderer.addVolume(actor);
      const interactor = renderWindow.getInteractor();
      interactor.setDesiredUpdateRate(15.0);
      renderer.resetCamera();
      renderer.getActiveCamera().zoom(1.5);
      renderer.getActiveCamera().elevation(70);
      renderWindow.render();
      // Ensure the volume rendering is updated with gradient opacity lighting
      // effects after the gradients have finished computing.
      interactor.requestAnimation("lighting");
      mapper.onLightingActivated(() => {
        interactor.cancelAnimation("lighting");
      });
    });
  });
