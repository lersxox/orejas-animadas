package com.example.earsmod;

import net.minecraft.client.model.*;

/** Modelos de las orejas. Origen = base de la oreja, +Y hacia abajo (la oreja crece hacia -Y). */
public final class EarModels {
    private EarModels() {}

    // Regiones de textura (32x32): A=(0,0) color principal, B=(0,12) punta/borde, C=(16,0) interior

    public static TexturedModelData fox() {
        ModelData data = new ModelData();
        ModelPartData root = data.getRoot();
        ModelPartBuilder b = ModelPartBuilder.create()
                .uv(0, 0).cuboid(-1.5f, -2f, -0.5f, 3f, 2f, 1f)
                .uv(0, 0).cuboid(-1.0f, -4f, -0.5f, 2f, 2f, 1f)
                .uv(0, 12).cuboid(-0.5f, -6f, -0.5f, 1f, 2f, 1f)      // punta oscura
                .uv(16, 0).cuboid(-0.5f, -3.6f, -0.65f, 1f, 3.2f, 0.2f); // interior claro
        root.addChild("left_ear", b, ModelTransform.pivot(2.5f, -8.3f, 0f));
        root.addChild("right_ear", b, ModelTransform.pivot(-2.5f, -8.3f, 0f));
        return TexturedModelData.of(data, 32, 32);
    }

    public static TexturedModelData cat() {
        ModelData data = new ModelData();
        ModelPartData root = data.getRoot();
        ModelPartBuilder b = ModelPartBuilder.create()
                .uv(0, 0).cuboid(-1.5f, -2f, -0.5f, 3f, 2f, 1f)
                .uv(0, 0).cuboid(-1.0f, -3f, -0.5f, 2f, 1f, 1f)
                .uv(0, 0).cuboid(-0.5f, -4f, -0.5f, 1f, 1f, 1f)
                .uv(16, 0).cuboid(-1.0f, -2.6f, -0.65f, 2f, 2.3f, 0.2f); // interior rosa
        root.addChild("left_ear", b, ModelTransform.pivot(2.6f, -8.3f, 0f));
        root.addChild("right_ear", b, ModelTransform.pivot(-2.6f, -8.3f, 0f));
        return TexturedModelData.of(data, 32, 32);
    }

    public static TexturedModelData dog() {
        ModelData data = new ModelData();
        ModelPartData root = data.getRoot();
        // Orejas caídas que cuelgan a los lados de la cabeza
        ModelPartBuilder left = ModelPartBuilder.create()
                .uv(0, 0).cuboid(0f, 0f, -1.5f, 1f, 3f, 3f)
                .uv(0, 12).cuboid(0f, 3f, -1.0f, 1f, 2f, 2f);
        ModelPartBuilder right = ModelPartBuilder.create()
                .uv(0, 0).cuboid(-1f, 0f, -1.5f, 1f, 3f, 3f)
                .uv(0, 12).cuboid(-1f, 3f, -1.0f, 1f, 2f, 2f);
        root.addChild("left_ear", left, ModelTransform.pivot(4.3f, -7.5f, 0f));
        root.addChild("right_ear", right, ModelTransform.pivot(-4.3f, -7.5f, 0f));
        return TexturedModelData.of(data, 32, 32);
    }
}
