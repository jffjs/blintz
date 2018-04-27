use std::cell::Cell;
use std::cmp::PartialEq;
use num_traits::ToPrimitive;
use opcode::OpCode;
use value::{Value, ValueArray};

pub struct Chunk {
    pub code: Vec<u8>,
    pub constants: ValueArray,
    lines: Vec<LineEncoding>
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
        self.push_line(line);
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

    pub fn get_line(&self, offset: usize) -> u32 {
        let mut offset_line = 0;
        for line in &self.lines {
            offset_line += line.run.get();

            if offset < offset_line as usize {
                return line.line;
            }
        }

        0
    }

    fn push_line(&mut self, line: u32) {
        if self.lines.len() > 0 {
            let last = &self.lines[self.lines.len() - 1];

            if last.line == line {
                last.inc();
                return;
            }
        }
        self.lines.push(LineEncoding::new(line));
    }
}

struct LineEncoding {
    run: Cell<u32>,
    line: u32
}

impl LineEncoding {
    fn new(line: u32) -> LineEncoding {
        LineEncoding { run: Cell::new(1), line }
    }

    fn inc(&self) {
        let run = self.run.get();
        self.run.set(run + 1);
    }
}

impl PartialEq for LineEncoding {
    fn eq(&self, other: &LineEncoding) -> bool {
        self.line == other.line
    }
}
