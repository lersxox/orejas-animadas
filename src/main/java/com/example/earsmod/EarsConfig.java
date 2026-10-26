package com.example.earsmod;

import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.AbstractClientPlayerEntity;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

public final class EarsConfig {
    public static EarType selected = EarType.FOX;
    public static boolean showOthers = false;
    public static boolean hideWithHelmet = true;
    public static volatile long wiggleUntil = 0;

    private EarsConfig() {}

    private static Path file() {
        return FabricLoader.getInstance().getConfigDir().resolve("earsmod.properties");
    }

    public static void load() {
        Properties p = new Properties();
        try (InputStream in = Files.newInputStream(file())) {
            p.load(in);
            selected = EarType.byId(p.getProperty("type", "fox"));
            showOthers = Boolean.parseBoolean(p.getProperty("showOthers", "false"));
            hideWithHelmet = Boolean.parseBoolean(p.getProperty("hideWithHelmet", "true"));
        } catch (IOException ignored) {
        }
    }

    public static void save() {
        Properties p = new Properties();
        p.setProperty("type", selected.id);
        p.setProperty("showOthers", String.valueOf(showOthers));
        p.setProperty("hideWithHelmet", String.valueOf(hideWithHelmet));
        try (OutputStream out = Files.newOutputStream(file())) {
            p.store(out, "Orejas Animadas");
        } catch (IOException ignored) {
        }
    }

    /** Tipo de orejas para un jugador. Los demás jugadores reciben uno según su UUID (solo visible para ti). */
    public static EarType typeFor(AbstractClientPlayerEntity player) {
        if (player == MinecraftClient.getInstance().player) return selected;
        if (!showOthers) return EarType.NONE;
        EarType[] pool = {EarType.FOX, EarType.CAT, EarType.DOG};
        return pool[Math.floorMod(player.getUuid().hashCode(), pool.length)];
    }
}
