use num_traits::FromPrimitive;
use chunk::Chunk;
use opcode::OpCode;

pub fn disassemble_chunk(chunk: &Chunk, name: &str) {
    println!("== {} ==", name);

    let mut offset = 0;
    loop {
        if offset >= chunk.len() {
            break;
        }

        offset = disassemble_instruction(chunk, offset);
    }
}

fn disassemble_instruction(chunk: &Chunk, offset: usize) -> usize {
    print!("{:04} ", offset);
    if offset > 0 && chunk.get_line(offset) == chunk.get_line(offset - 1) {
        print!("   | ");
    } else {
        print!("{:4} ", chunk.get_line(offset));
    }

    let instruction = chunk.code[offset];

    match OpCode::from_u8(instruction) {
        Some(opcode) => {
            match opcode {
                OpCode::OpConstant => constant_instruction("OP_CONSTANT", chunk, offset),
                OpCode::OpReturn => simple_instruction("OP_RETURN", offset),
                // _ => panic!(format!("Implement disassembly for opcode {:?}", opcode))
            }
        },
        None => {
            println!("Unknown opcode {}", instruction);
            offset + 1
        }
    }
}

fn constant_instruction(name: &str, chunk: &Chunk, offset: usize) -> usize {
    let constant = chunk.code[offset + 1];
    // when values get more complex, maybe implement Display for Value type
    println!("{:<16} {:4} '{}'", name, constant, chunk.constants.values[constant as usize]);
    offset + 2
}

fn simple_instruction(name: &str, offset: usize) -> usize {
    println!("{}", name);
    offset + 1
}
