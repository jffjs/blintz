use num_traits::ToPrimitive;
use opcode::OpCode;
use value::{Value, ValueArray};

pub struct Chunk {
    pub code: Vec<u8>,
    pub constants: ValueArray,
    pub lines: Vec<u32>,
}

impl Chunk {
    pub fn new() -> Chunk {
        Chunk {
            code: vec![],
            constants: ValueArray::new(),
            lines: vec![]
        }
    }

    pub fn len(&self) -> usize {
        self.code.len()
    }

    pub fn write_byte(&mut self, byte: u8, line: u32) {
        self.code.push(byte);
        self.lines.push(line);
    }

    pub fn write_op(&mut self, opcode: OpCode, line: u32) {
        match opcode.to_u8() {
            Some(byte) => self.write_byte(byte, line),
            None => panic!(format!("Unknown opcode: {:?}", opcode))
        }
    }

    pub fn add_constant(&mut self, value: Value) -> u8 {
        self.constants.write_value(value);
        (self.constants.len() - 1) as u8
    }
}

