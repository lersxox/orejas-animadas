package com.example.earsmod;

import net.minecraft.client.model.ModelPart;
import net.minecraft.client.network.AbstractClientPlayerEntity;
import net.minecraft.client.render.RenderLayer;
import net.minecraft.client.render.VertexConsumer;
import net.minecraft.client.render.VertexConsumerProvider;
import net.minecraft.client.render.entity.LivingEntityRenderer;
import net.minecraft.client.render.entity.feature.FeatureRenderer;
import net.minecraft.client.render.entity.feature.FeatureRendererContext;
import net.minecraft.client.render.entity.model.EntityModelLoader;
import net.minecraft.client.render.entity.model.PlayerEntityModel;
import net.minecraft.client.util.math.MatrixStack;
import net.minecraft.entity.EquipmentSlot;

import java.util.EnumMap;
import java.util.Map;

public class EarsFeatureRenderer extends FeatureRenderer<AbstractClientPlayerEntity, PlayerEntityModel<AbstractClientPlayerEntity>> {
    private final Map<EarType, ModelPart[]> parts = new EnumMap<>(EarType.class);

    public EarsFeatureRenderer(FeatureRendererContext<AbstractClientPlayerEntity, PlayerEntityModel<AbstractClientPlayerEntity>> ctx,
                               EntityModelLoader loader) {
        super(ctx);
        for (EarType t : EarType.values()) {
            if (t.layer == null) continue;
            ModelPart root = loader.getModelPart(t.layer);
            parts.put(t, new ModelPart[]{root.getChild("left_ear"), root.getChild("right_ear")});
        }
    }

    @Override
    public void render(MatrixStack matrices, VertexConsumerProvider vertexConsumers, int light,
                       AbstractClientPlayerEntity player, float limbAngle, float limbDistance, float tickDelta,
                       float animationProgress, float headYaw, float headPitch) {
        if (player.isInvisible() || player.isSpectator()) return;
        EarType type = EarsConfig.typeFor(player);
        if (type == EarType.NONE) return;
        if (EarsConfig.hideWithHelmet && !player.getEquippedStack(EquipmentSlot.HEAD).isEmpty()) return;

        float[] pose = EarAnimator.update(player, type, limbAngle, limbDistance, tickDelta, animationProgress, headYaw, headPitch);
        ModelPart[] ears = parts.get(type);
        ModelPart left = ears[0], right = ears[1];
        left.pitch = pose[0]; left.yaw = pose[1]; left.roll = pose[2];
        right.pitch = pose[3]; right.yaw = pose[4]; right.roll = pose[5];

        matrices.push();
        getContextModel().head.rotate(matrices); // sigue la cabeza (incluido agacharse)
        VertexConsumer vc = vertexConsumers.getBuffer(RenderLayer.getEntityCutoutNoCull(type.texture));
        int overlay = LivingEntityRenderer.getOverlay(player, 0f);
        left.render(matrices, vc, light, overlay);
        right.render(matrices, vc, light, overlay);
        matrices.pop();
    }
}
