#[derive(Debug, Primitive)]
pub enum OpCode {
    OpConstant = 0,
    OpConstantLong = 1,
    OpReturn = 2,
}
