package com.example.earsmod;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import net.fabricmc.fabric.api.client.rendering.v1.EntityModelLayerRegistry;
import net.fabricmc.fabric.api.client.rendering.v1.LivingEntityFeatureRendererRegistrationCallback;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.render.entity.PlayerEntityRenderer;
import net.minecraft.client.util.InputUtil;
import net.minecraft.text.Text;
import org.lwjgl.glfw.GLFW;

public class EarsModClient implements ClientModInitializer {
    public static final String MOD_ID = "earsmod";

    @Override
    public void onInitializeClient() {
        EarsConfig.load();

        EntityModelLayerRegistry.registerModelLayer(EarType.FOX.layer, EarModels::fox);
        EntityModelLayerRegistry.registerModelLayer(EarType.CAT.layer, EarModels::cat);
        EntityModelLayerRegistry.registerModelLayer(EarType.DOG.layer, EarModels::dog);

        LivingEntityFeatureRendererRegistrationCallback.EVENT.register((entityType, renderer, helper, ctx) -> {
            if (renderer instanceof PlayerEntityRenderer playerRenderer) {
                helper.register(new EarsFeatureRenderer(playerRenderer, ctx.getModelLoader()));
            }
        });

        KeyBinding cycle = KeyBindingHelper.registerKeyBinding(
                new KeyBinding("key.earsmod.cycle", InputUtil.Type.KEYSYM, GLFW.GLFW_KEY_G, "category.earsmod"));
        KeyBinding wiggle = KeyBindingHelper.registerKeyBinding(
                new KeyBinding("key.earsmod.wiggle", InputUtil.Type.KEYSYM, GLFW.GLFW_KEY_H, "category.earsmod"));
        KeyBinding others = KeyBindingHelper.registerKeyBinding(
                new KeyBinding("key.earsmod.others", InputUtil.Type.KEYSYM, GLFW.GLFW_KEY_J, "category.earsmod"));

        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (client.player == null) return;
            while (cycle.wasPressed()) {
                EarsConfig.selected = EarsConfig.selected.next();
                EarsConfig.save();
                client.player.sendMessage(Text.translatable("earsmod.type." + EarsConfig.selected.id), true);
            }
            while (wiggle.wasPressed()) {
                EarsConfig.wiggleUntil = System.currentTimeMillis() + 2500;
            }
            while (others.wasPressed()) {
                EarsConfig.showOthers = !EarsConfig.showOthers;
                EarsConfig.save();
                client.player.sendMessage(Text.translatable(EarsConfig.showOthers ? "earsmod.others.on" : "earsmod.others.off"), true);
            }
        });

        ClientPlayConnectionEvents.DISCONNECT.register((handler, client) -> EarAnimator.clear());
    }
}
