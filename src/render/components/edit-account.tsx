import { cn } from '@render/lib/utils'
import { Button } from '@render/components/ui/button'

import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@render/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@render/components/ui/form'
import { Input } from '@render/components/ui/input'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ipcAPI } from '@render/api'
import type { CreateAccountDto } from '@common/dto/create-account.dto'
import type { IAccount } from '@common/models.types'
import type { UpdateAccountDto } from '@common/dto/update-account.dto'

interface IEditAccountProps {
  isCollapsed: boolean
  account: IAccount
  open: boolean
  onOpenChange: (opened: boolean) => void
}

const formSchema = zod.object({
  name: zod.string().min(3).max(10),
  email: zod.string().email(),
  password: zod.string().min(1),
})

function EditAccount({ isCollapsed, account, open, onOpenChange }: IEditAccountProps) {
  const form = useForm<CreateAccountDto>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (account) {
      form.setValue('name', account.name)
      form.setValue('email', account.email)
      form.setValue('password', account.password)
    }
  }, [account])

  const onSave = async (data: Omit<UpdateAccountDto, 'id'>) => {
    await ipcAPI.updateAccount({
      id: account.id,
      ...data,
    })
    return onOpenChange(false)
  }

  return (
    <div className={cn('flex h-[64px] items-center justify-center', isCollapsed ? 'h-[52px]' : 'px-2')}>
      <Dialog open={open} onOpenChange={opened => onOpenChange(opened)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit account</DialogTitle>
            <DialogDescription>
              Edit VK Play Live account
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

export default EditAccount
