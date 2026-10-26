package com.example.earsmod;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.AbstractClientPlayerEntity;
import net.minecraft.util.UseAction;
import net.minecraft.util.math.MathHelper;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Calcula la pose de las orejas con un sistema de resortes (física secundaria),
 * así las orejas rebotan, se retrasan al girar la cabeza y se mueven de forma natural.
 *
 * Canales: 0 pitchIzq, 1 yawIzq, 2 rollIzq, 3 pitchDer, 4 yawDer, 5 rollDer.
 * pitch: + adelante / - atrás.  roll: ángulo directo del ModelPart.
 */
public final class EarAnimator {
    private static final Map<UUID, State> STATES = new HashMap<>();

    private static final class State {
        final float[] pos = new float[6];
        final float[] vel = new float[6];
        final float[] target = new float[6];
        long lastNanos = 0;
        float lastHeadYaw, lastHeadPitch;
        boolean init, wasAirborne;
        double lastVy;
    }

    private EarAnimator() {}

    public static void clear() {
        STATES.clear();
    }

    private static int hash(int a, int b) {
        int h = a * 31 + b;
        h ^= h >>> 15;
        h *= 0x2c1b3c6d;
        h ^= h >>> 12;
        return h;
    }

    public static float[] update(AbstractClientPlayerEntity p, EarType type, float limbAngle, float limbDistance,
                                 float tickDelta, float t, float headYaw, float headPitch) {
        State s = STATES.computeIfAbsent(p.getUuid(), k -> new State());
        boolean dog = type == EarType.DOG;
        boolean cat = type == EarType.CAT;
        float rs = type.rollSign;

        // ---------- Estado del jugador ----------
        float speed = Math.min(1f, limbDistance);
        boolean sneaking = p.isInSneakingPose();
        boolean sprint = p.isSprinting() && speed > 0.1f;
        boolean elytra = p.isFallFlying();
        boolean swim = p.isSwimming() || (p.isTouchingWater() && !p.isOnGround());
        boolean sleeping = p.isSleeping();
        boolean creativeFly = p.getAbilities().flying;
        boolean air = !p.isOnGround() && !p.isTouchingWater() && !p.isClimbing() && !elytra && !creativeFly;
        double vy = p.getVelocity().y;
        float rise = air && vy > 0.05 ? (float) Math.min(1.0, vy * 2.5) : 0f;
        float fall = air && vy < -0.1 ? (float) Math.min(1.0, -vy * 2.0) : 0f;
        boolean hurt = p.hurtTime > 0;
        boolean lowHealth = p.getHealth() <= 6f;
        UseAction ua = p.isUsingItem() ? p.getActiveItem().getUseAction() : UseAction.NONE;
        boolean eating = ua == UseAction.EAT || ua == UseAction.DRINK;
        float swing = p.getHandSwingProgress(tickDelta);
        float ph = (p.getUuid().hashCode() & 0xff) * 0.05f;

        // ---------- Objetivos ----------
        float pitch = type.restPitch;
        float out = type.restOutward;
        float dPL = 0, dPR = 0, dOL = 0, dOR = 0;

        // Reposo: respiración suave
        pitch += (float) Math.sin(t * 0.07f + ph) * 0.03f;
        out += (float) Math.sin(t * 0.045f + ph * 2f) * 0.02f;

        // Reposo: tics aleatorios (una oreja se sacude de vez en cuando)
        float idle = 1f - Math.min(1f, speed * 4f);
        int win = (int) Math.floor(t / 60f);
        int h = hash(p.getUuid().hashCode(), win);
        int chanceMask = cat ? 1 : 3;
        if (idle > 0.5f && (h & chanceMask) == 0) {
            float k = (t - win * 60f) / 60f / 0.22f;
            if (k >= 0f && k < 1f) {
                float f = (float) Math.sin(k * Math.PI * 3) * (1f - k) * 0.55f * idle;
                if (((h >> 4) & 1) == 0) { dPL -= f; dOL += f * 0.5f; }
                else { dPR -= f; dOR += f * 0.5f; }
            }
        }

        // Caminar
        float sp = limbAngle * 0.6662f;
        float bob = (float) Math.cos(sp * 2f) * speed;
        float alt = (float) Math.sin(sp) * speed;
        if (dog) {
            pitch += bob * 0.25f;
            out += speed * 0.35f + Math.abs(bob) * 0.15f;
            dPL += alt * 0.12f; dPR -= alt * 0.12f;
        } else {
            pitch += bob * 0.10f - speed * 0.10f;
            dPL += alt * 0.06f; dPR -= alt * 0.06f;
        }

        // Correr
        if (sprint) {
            if (dog) { out += 0.45f + (float) Math.sin(t * 1.3f) * 0.12f; pitch -= 0.15f; }
            else { pitch -= 0.35f; out += 0.10f; }
        }

        // Salto (subiendo) y caída
        if (dog) {
            pitch += rise * 0.2f; out -= rise * 0.10f;
            out += fall * 1.0f + (float) Math.sin(t * 2.0f) * 0.15f * fall;
        } else {
            pitch += rise * 0.15f; out -= rise * 0.05f;
            pitch -= fall * 0.45f; out += fall * 0.15f;
        }

        // Agachado
        if (sneaking) {
            if (cat) { out += 0.75f; pitch -= 0.10f; }   // "orejas de avión"
            else if (dog) { pitch += 0.12f; out -= 0.05f; }
            else { pitch -= 0.30f; out += 0.08f; }
        }

        // Nadar
        if (swim) {
            if (dog) { out += 0.5f + (float) Math.sin(t * 0.15f) * 0.1f; pitch -= 0.1f; }
            else { pitch -= 0.30f; out += 0.12f; }
        }

        // Elytra
        if (elytra) {
            if (dog) { out += 1.1f + (float) Math.sin(t * 2.2f) * 0.2f; pitch -= 0.3f; }
            else { pitch -= 0.65f; out += 0.05f; }
        }

        // Dormir
        if (sleeping) {
            if (dog) out -= 0.08f; else { out += 0.4f; pitch += 0.15f; }
            out += (float) Math.sin(t * 0.06f) * 0.04f;
        }

        // Poca vida: orejas tristes
        if (lowHealth && !hurt) {
            if (dog) { out -= 0.08f; pitch += 0.08f; }
            else { out += 0.35f; pitch -= 0.08f; }
        }

        // Daño: orejas hacia atrás
        if (hurt) {
            pitch -= 0.6f;
            out += dog ? 0.6f : 0.2f;
        }

        // Comer / beber: se mueven al masticar
        if (eating) {
            float c = (float) Math.sin(t * 1.4f) * 0.10f;
            dPL += c; dPR -= c;
        }

        // Golpear / atacar
        if (swing > 0f) {
            float sw = (float) Math.sin(swing * Math.PI);
            pitch += sw * 0.22f;
            out += dog ? sw * 0.25f : -sw * 0.04f;
        }

        // Emote: mover orejitas (tecla H, solo en tu jugador)
        if (System.currentTimeMillis() < EarsConfig.wiggleUntil && p == MinecraftClient.getInstance().player) {
            float w = (float) Math.sin(t * 0.95f) * 0.55f;
            dPL += w; dPR -= w;
            dOL += Math.max(0f, w) * 0.6f;
            dOR += Math.max(0f, -w) * 0.6f;
        }

        out = MathHelper.clamp(out, -0.3f, 1.6f);

        s.target[0] = pitch + dPL;
        s.target[3] = pitch + dPR;
        s.target[1] = 0f;
        s.target[4] = 0f;
        s.target[2] = rs * (out + dOL);
        s.target[5] = -rs * (out + dOR);

        // ---------- Primera vez ----------
        if (!s.init) {
            System.arraycopy(s.target, 0, s.pos, 0, 6);
            s.lastHeadYaw = headYaw;
            s.lastHeadPitch = headPitch;
            s.init = true;
        }

        // ---------- Impulsos: despegue y aterrizaje ----------
        if (!s.wasAirborne && air && vy > 0.1) {
            s.vel[0] += 3f; s.vel[3] += 3f;
            if (dog) { s.vel[2] -= rs * 3f; s.vel[5] += rs * 3f; }
        }
        if (s.wasAirborne && !air && s.lastVy < -0.2) {
            float imp = (float) Math.min(8.0, -s.lastVy * 14.0);
            s.vel[0] += imp; s.vel[3] += imp;
            if (dog) { s.vel[2] += rs * imp * 0.6f; s.vel[5] -= rs * imp * 0.6f; }
        }
        if (air) s.lastVy = vy;
        s.wasAirborne = air;

        // ---------- Retraso al girar la cabeza ----------
        float dYaw = MathHelper.clamp(MathHelper.wrapDegrees(headYaw - s.lastHeadYaw) * MathHelper.RADIANS_PER_DEGREE, -0.6f, 0.6f);
        float dPitch = MathHelper.clamp((headPitch - s.lastHeadPitch) * MathHelper.RADIANS_PER_DEGREE, -0.6f, 0.6f);
        s.lastHeadYaw = headYaw;
        s.lastHeadPitch = headPitch;
        s.pos[1] -= dYaw * 0.30f;
        s.pos[4] -= dYaw * 0.30f;
        s.pos[0] -= dPitch * 0.35f;
        s.pos[3] -= dPitch * 0.35f;
        if (dog) { // las orejas caídas se abren al girar rápido
            float flare = Math.abs(dYaw) * 0.5f;
            s.pos[2] += rs * flare;
            s.pos[5] -= rs * flare;
        }

        // ---------- Integración del resorte ----------
        long now = System.nanoTime();
        float dt = s.lastNanos == 0 ? 0f : Math.min((now - s.lastNanos) / 1.0e9f, 0.05f);
        if (dt > 0.0005f) {
            s.lastNanos = now;
            int steps = Math.max(1, (int) Math.ceil(dt / 0.008f));
            float hs = dt / steps;
            for (int n = 0; n < steps; n++) {
                for (int i = 0; i < 6; i++) {
                    float a = type.spring * (s.target[i] - s.pos[i]) - type.damping * s.vel[i];
                    s.vel[i] += a * hs;
                    s.pos[i] += s.vel[i] * hs;
                }
            }
        } else if (s.lastNanos == 0) {
            s.lastNanos = now;
        }
        return s.pos;
    }
}
