use num_traits::ToPrimitive;
use opcode::OpCode;

pub struct Chunk {
    data: Vec<u8>
}

impl Chunk {
    pub fn new() -> Chunk {
        Chunk { data: vec![] }
    }

    pub fn write_byte(&mut self, byte: u8) {
        self.data.push(byte);
    }

    pub fn write_op(&mut self, opcode: OpCode) {
        match opcode.to_u8() {
            Some(byte) => self.write_byte(byte),
            None => panic!(format!("Unknown opcode: {:?}", opcode))
        }
    }
}

