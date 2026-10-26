package com.example.earsmod;

import net.minecraft.client.render.entity.model.EntityModelLayer;
import net.minecraft.util.Identifier;

public enum EarType {
    NONE("none", 0, 0, 0, 0, 0),
    // id, rollSign (+1 orejas erguidas, -1 colgantes), reposo-hacia-fuera, reposo-pitch, rigidez del resorte, amortiguación
    FOX("fox", 1, 0.10f, 0.00f, 170f, 16f),
    CAT("cat", 1, 0.22f, 0.05f, 200f, 18f),
    DOG("dog", -1, 0.12f, 0.00f, 70f, 4.5f);

    public final String id;
    public final float rollSign, restOutward, restPitch, spring, damping;
    public final Identifier texture;
    public final EntityModelLayer layer;

    EarType(String id, float rollSign, float restOutward, float restPitch, float spring, float damping) {
        this.id = id;
        this.rollSign = rollSign;
        this.restOutward = restOutward;
        this.restPitch = restPitch;
        this.spring = spring;
        this.damping = damping;
        if (id.equals("none")) {
            texture = null;
            layer = null;
        } else {
            texture = new Identifier(EarsModClient.MOD_ID, "textures/entity/" + id + "_ears.png");
            layer = new EntityModelLayer(new Identifier(EarsModClient.MOD_ID, id + "_ears"), "main");
        }
    }

    public EarType next() {
        EarType[] v = values();
        return v[(ordinal() + 1) % v.length];
    }

    public static EarType byId(String id) {
        for (EarType t : values()) if (t.id.equals(id)) return t;
        return FOX;
    }
}
