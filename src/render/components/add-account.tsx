import { cn } from '@render/lib/utils'
import { Button } from '@render/components/ui/button'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@render/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@render/components/ui/form'
import { Input } from '@render/components/ui/input'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ipcAPI } from '@render/api'
import type { CreateAccountDto } from '@common/dto/create-account.dto'

interface IAddAccountProps {
  isCollapsed: boolean
}

const formSchema = zod.object({
  name: zod.string().min(3).max(10),
  email: zod.string().email(),
  password: zod.string().min(1),
})

function AddAccount({ isCollapsed }: IAddAccountProps) {
  const [open, setOpen] = useState<boolean>()

  const form = useForm<CreateAccountDto>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSave = async (data: CreateAccountDto) => {
    await ipcAPI.createAccount(data)
    return setOpen(false)
  }

  return (
    <div className={cn('flex h-[64px] items-center justify-center', isCollapsed ? 'h-[52px]' : 'px-2')}>
      <Dialog open={open} onOpenChange={open1 => setOpen(open1)}>
        <DialogTrigger asChild>
          <Button variant="outline">Add account</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
            <DialogDescription>
              Add VK Play Live account credentials
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              >
              </FormField>
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              >
              </FormField>
              <FormField
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              >
              </FormField>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddAccount
