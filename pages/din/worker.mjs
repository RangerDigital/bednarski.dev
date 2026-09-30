// Geometry runs off the main thread so the parameter form stays responsive.
import wasmURL from 'manifold-3d/manifold.wasm?url';
import { createGenerator, toSTL } from './core.mjs';

const ready = createGenerator({ locateFile: () => wasmURL });

self.onmessage = async ({ data }) => {
  const { id, parameters, action = 'generate', partName = 'main' } = data;

  try {
    if (!['generate', 'stl'].includes(action)) throw new Error('Unknown worker action.');

    const model = (await ready).generate(parameters);

    if (action === 'stl') {
      const part = model.printParts.find((candidate) => candidate.name === partName);
      if (!part) throw new Error('Unknown part name.');

      const bytes = toSTL(part.mesh);
      self.postMessage({ id, ok: true, partName, bytes }, [bytes.buffer]);
      return;
    }

    const transfer = [...model.parts, ...model.printParts, model.reference].flatMap((part) => [
      part.mesh.positions.buffer,
      part.mesh.indices.buffer,
    ]);
    self.postMessage({ id, ok: true, model }, transfer);
  } catch (error) {
    self.postMessage({ id, ok: false, error: error.message, errors: error.errors ?? [error.message] });
  }
};
