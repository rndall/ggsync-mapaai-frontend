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
import { getReturnPath } from '@/features/auth/return-path'

import PasswordInput from './password-input'

const formSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
})

export default function LoginForm({ redirect }: { redirect?: string }) {
  const { mutate: login, isPending: isSubmitting } = useLogin()
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      login(
        { body: value },
        {
          onSuccess: () => {
            form.reset()
            router.navigate({ href: getReturnPath(redirect), replace: true })
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
            <p className="font-heading text-3xl">Welcome Back!</p>
            <p>
              Don't have an account?
              <Link
                to="/register"
                search={redirect !== undefined ? { redirect } : {}}
                className={buttonVariants({
                  variant: 'link',
                  className: 'font-sans text-base! font-normal text-primary',
                })}
              >
                Register
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
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="h-12 font-button text-sm! tracking-wide placeholder:text-muted-foreground"
                    aria-required="true"
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
                  placeholder="Enter your password"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  autoComplete="current-password"
                  aria-required="true"
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
            className="w-28 rounded-none text-sm text-[#1C304C]"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
            {isSubmitting && <Spinner />}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
