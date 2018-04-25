#[derive(Primitive)]
pub enum OpCode {
    OpReturn = 0
}

pub type Chunk = Vec<u8>;

pub fn new_chunk() -> Chunk {
    return vec![];
}

pub fn write_chunk(chunk: &mut Chunk, byte: u8) {
    chunk.push(byte);
}
