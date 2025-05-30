import { useCallback, useEffect, useState } from 'react'
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { Chain, formatEther, parseEther } from 'viem'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import Erc20TokenAbi from '@/contracts/ERC20TokenAbi'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'

type SendErc20ModalProps = {
  chain?: Chain
  userAddress: `0x${string}` | undefined
}

export default function SendErc20Modal({
  chain,
  userAddress,
}: SendErc20ModalProps) {
  const [toAddress, setToAddress] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  const erc20ContractAddress = process.env.NEXT_PUBLIC_PULPA_TOKEN_ADDRESS ?? ''

  const {
    data: erc20Balance,
    isSuccess,
    refetch: refetchErc20Balance,
  } = useReadContract({
    abi: Erc20TokenAbi,
    address: erc20ContractAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [userAddress ?? '0x0'],
    query: {
      enabled: Boolean(userAddress) && Boolean(erc20ContractAddress),
    },
  })

  const { data: hash, isPending, writeContractAsync } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  async function submitTransferErc20(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userAddress) {
      toast.warning('You must connect your wallet...')
      return
    }
    if (!erc20Balance) {
      toast.warning('You must have a balance of $PULPA to send...')
      return
    }
    try {
      await writeContractAsync({
        abi: Erc20TokenAbi,
        address: erc20ContractAddress as `0x${string}`,
        functionName: 'transfer',
        args: [toAddress as `0x${string}`, parseEther(tokenAmount)],
      })
    } catch (error) {
      console.error(error)
    }
  }

  const refetchBalance = useCallback(async () => {
    await refetchErc20Balance()
  }, [refetchErc20Balance])

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
    }
  }, [isMounted])

  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      toast.success(`Sent ${tokenAmount} $PULPA`)
    }
  }, [isConfirmed, refetchBalance, tokenAmount])

  const status = isPending
    ? 'enviando'
    : isConfirming
      ? 'confirmando'
      : 'enviar'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>enviar $PULPA</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">enviar $PULPA</DialogTitle>
          <DialogDescription>
            el monto ingresado será enviado a la dirección una vez que presiones
            el botón enviar
          </DialogDescription>
        </DialogHeader>
        {isMounted ? (
          <div className="w-full">
            <div className="flex flex-col text-center">
              {isSuccess ? (
                <>
                  <h2>
                    {parseFloat(formatEther(erc20Balance as bigint)).toFixed(2)}
                  </h2>
                  <h4>$PULPA</h4>
                </>
              ) : (
                <p>cargando...</p>
              )}
            </div>
            <form
              className="flex w-full flex-col gap-y-8"
              onSubmit={submitTransferErc20}
            >
              <div className="flex w-full flex-col gap-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="address">dirección</Label>
                  <Input
                    name="address"
                    placeholder="0xA0Cf…251e"
                    required
                    onChange={(event) => setToAddress(event.target.value)}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="value">cantidad</Label>
                  <Input
                    name="value"
                    placeholder="0.05"
                    required
                    onChange={(event) => setTokenAmount(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex w-full justify-center">
                <Button type="submit" disabled={isPending || isConfirming}>
                  {status}
                </Button>
              </div>
            </form>
            {hash && (
              <div className="flex flex-col items-center pt-8">
                <Link
                  className="flex items-center gap-x-1.5 hover:text-accent"
                  href={`${chain?.blockExplorers?.default.url}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ver tx en explorador <ExternalLinkIcon className="h4 w-4" />
                </Link>
                {isConfirming && <div>esperando confirmación...</div>}
                {isConfirmed && <div>transacción confirmada</div>}
              </div>
            )}
          </div>
        ) : (
          <p>cargando...</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
