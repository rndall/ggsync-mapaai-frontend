import { useForm } from '@tanstack/react-form'
import { Link, useRouter } from '@tanstack/react-router'
import { User } from 'lucide-react'
import z from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useLogin } from '@/features/auth/hooks/use-login'
import { useRegister } from '@/features/auth/hooks/use-register'
import { getReturnPath } from '@/features/auth/return-path'

import PasswordInput from './password-input'

const baseSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be at most 50 characters.'),
  password: z.string().min(5, 'Password must be at least 5 characters.'),
  password_confirmation: z.string(),
})

const formSchema = baseSchema.refine(
  (data) => data.password === data.password_confirmation,
  {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
    when(payload) {
      return baseSchema
        .pick({ password: true, password_confirmation: true })
        .safeParse(payload.value).success
    },
  },
)

export default function RegisterForm({ redirect }: { redirect?: string }) {
  const { mutate: register, isPending: isRegistering } = useRegister()
  const { mutate: login, isPending: isLoggingIn } = useLogin()
  const router = useRouter()
  // Registration chains into an automatic sign-in: block while either runs.
  const isSubmitting = isRegistering || isLoggingIn

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
      password_confirmation: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      register(
        { body: value },
        {
          onSuccess: () => {
            // Registration returns no token: sign in with the same
            // credentials so the visitor ends up authenticated.
            login(
              {
                body: {
                  username: value.username,
                  password: value.password,
                },
              },
              {
                onSuccess: () => {
                  form.reset()
                  router.navigate({
                    href: getReturnPath(redirect),
                    replace: true,
                  })
                },
              },
            )
          },
        },
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      noValidate
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="font-heading text-2xl">
            Mapa <span className="text-primary">AI</span>
          </h1>
          <div>
            <p className="font-heading text-3xl">Create an Account</p>
            <p>
              Already have an account?
              <Link
                to="/login"
                search={redirect !== undefined ? { redirect } : {}}
                className={buttonVariants({
                  variant: 'link',
                  className: 'font-sans text-base! font-normal text-primary',
                })}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
        <form.Field
          name="username"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <InputGroup className="h-12 rounded-none">
                  <InputGroupAddon className="p-4">
                    <User className="size-5" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    placeholder="Username"
                    aria-required="true"
                    className="h-12 font-button text-sm! tracking-wide placeholder:text-muted-foreground"
                  />
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <PasswordInput
                  placeholder="Password"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  aria-required="true"
                  autoComplete="new-password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="password_confirmation"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <PasswordInput
                  placeholder="Confirm Password"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  aria-required="true"
                  autoComplete="new-password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <Field orientation="horizontal" className="justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-30 rounded-none text-sm text-[#1C304C]"
          >
            Register
            {isSubmitting && <Spinner />}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
