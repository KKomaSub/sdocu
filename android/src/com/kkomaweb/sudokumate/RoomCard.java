package com.kkomaweb.sudokumate;

import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import java.util.Arrays;
import java.nio.charset.StandardCharsets;

public final class RoomCard extends HostApduService {
    static final byte[] SELECT = {0, (byte)0xA4, 4, 0, 8, (byte)0xF0, 0x53, 0x55, 0x44, 0x4F, 0x4B, 0x55, 1};
    static volatile String openRoom = "";

    static byte[] response(byte[] command, String room) {
        boolean selected = Arrays.equals(command, SELECT) || Arrays.equals(command, Arrays.copyOf(SELECT, SELECT.length + 1));
        if (!selected || !room.matches("[0-9]{4}")) return new byte[]{0x6A, (byte)0x82};
        byte[] result = Arrays.copyOf(room.getBytes(StandardCharsets.US_ASCII), 6);
        result[4] = (byte)0x90;
        return result;
    }

    @Override public byte[] processCommandApdu(byte[] command, Bundle extras) { return response(command, openRoom); }
    @Override public void onDeactivated(int reason) {}
}
