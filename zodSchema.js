const { z, ZodError } = require("zod");

const validatePatientSchema = z.object({
  name: z.string().max(100),
  age: z.number().min(0),
  email: z.string().email(),
  mobile: z.string().length(10, "Mobile number should be 10 digits"),
  countryCode: z.string().min(1),
  password: z
    .string()
    .min(8)
    .refine(
      (val) => /[A-Z]/.test(val) && /[0-9]/.test(val) && /[@$!%*?&#]/.test(val),
      {
        message:
          "Password must include at least one uppercase letter, one number, and one special character",
      }
    ),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

module.exports = {
  validatePatientSchema,
  loginSchema,
};
